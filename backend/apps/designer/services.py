"""
Business logic and service layer for Fabric.js Design Editor.
"""

from decimal import Decimal
from PIL import Image
import cloudinary.uploader
from django.core.files.storage import default_storage

from apps.catalog.models import Category, PrintingMethod
from .models import DesignAsset, DesignSession, DesignVersion, PlacementDesign


def get_or_create_session(user=None, session_key="", category_id=None):
    """
    Finds or creates a design session for the given category.
    Pre-populates the 6 placements (fr, bk, lp, rp, ls, rs).
    """
    category = Category.objects.get(id=category_id)
    default_color = category.default_color or category.colors.first()
    default_size = category.sizes.first()
    default_print = category.printing_methods.first()

    session = DesignSession.objects.create(
        user=user if user and user.is_authenticated else None,
        session_key=session_key or "",
        category=category,
        selected_color=default_color,
        selected_size=default_size,
        selected_printing_method=default_print,
        title=f"Custom {category.name}",
    )

    # Pre-populate all 6 placement slots
    placement_choices = ["fr", "bk", "lp", "rp", "ls", "rs"]
    for code in placement_choices:
        PlacementDesign.objects.create(
            session=session,
            placement=code,
            has_artwork=False,
            width_inches=category.default_print_width_inches,
            height_inches=category.default_print_height_inches,
        )

    return session


def save_session_data(session, data):
    """
    Updates design session selections, placement canvas states, and creates a version snapshot.
    """
    if "title" in data:
        session.title = data["title"]
    if "selected_color" in data:
        session.selected_color = data["selected_color"]
    if "selected_size" in data:
        session.selected_size = data["selected_size"]
    if "selected_printing_method" in data:
        session.selected_printing_method = data["selected_printing_method"]

    session.status = DesignSession.Status.SAVED
    session.save()

    placements_data = data.get("placements", [])
    for p_data in placements_data:
        code = p_data.get("placement")
        placement_obj, _ = PlacementDesign.objects.get_or_create(
            session=session,
            placement=code,
        )
        placement_obj.has_artwork = p_data.get("has_artwork", False)
        placement_obj.canvas_json = p_data.get("canvas_json", {})
        placement_obj.design_image_url = p_data.get("design_image_url", "")
        placement_obj.preview_mockup_url = p_data.get("preview_mockup_url", "")
        placement_obj.width_inches = p_data.get("width_inches", Decimal("0.00"))
        placement_obj.height_inches = p_data.get("height_inches", Decimal("0.00"))
        placement_obj.dpi = p_data.get("dpi", 300)
        placement_obj.rotation_angle = p_data.get("rotation_angle", 0.0)
        placement_obj.quality_rating = p_data.get("quality_rating", "Good")
        placement_obj.save()

    # Create immutable version snapshot
    version_count = session.versions.count() + 1
    snapshot_data = {
        "title": session.title,
        "category_id": str(session.category.id),
        "category_name": session.category.name,
        "selected_color_id": session.selected_color.id if session.selected_color else None,
        "selected_size_id": session.selected_size.id if session.selected_size else None,
        "selected_printing_method_id": (
            session.selected_printing_method.id if session.selected_printing_method else None
        ),
        "placements": [
            {
                "placement": p.placement,
                "has_artwork": p.has_artwork,
                "canvas_json": p.canvas_json,
                "design_image_url": p.design_image_url,
                "preview_mockup_url": p.preview_mockup_url,
                "width_inches": float(p.width_inches),
                "height_inches": float(p.height_inches),
                "dpi": p.dpi,
                "rotation_angle": p.rotation_angle,
                "quality_rating": p.quality_rating,
                "design_code": p.design_code,
            }
            for p in session.placements.all()
        ],
    }

    DesignVersion.objects.create(
        session=session,
        version_number=version_count,
        snapshot=snapshot_data,
        is_final_order=False,
    )

    return session


def handle_artwork_upload(file_obj, user=None):
    """
    Processes an uploaded artwork file, gets its dimensions with PIL,
    uploads to Cloudinary / storage, and saves a DesignAsset record.
    """
    img = Image.open(file_obj)
    width_px, height_px = img.size
    mime_type = Image.MIME.get(img.format, "image/png")
    file_obj.seek(0)
    file_size_bytes = file_obj.size

    # Upload to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(
            file_obj,
            folder="custom_designs/assets",
            resource_type="image",
        )
        image_url = upload_result.get("secure_url", "")
    except Exception:
        # Fallback to default storage
        file_path = default_storage.save(f"designs/{file_obj.name}", file_obj)
        image_url = default_storage.url(file_path)

    asset = DesignAsset.objects.create(
        user=user if user and user.is_authenticated else None,
        image_url=image_url,
        original_filename=file_obj.name,
        width_px=width_px,
        height_px=height_px,
        file_size_bytes=file_size_bytes,
        mime_type=mime_type,
    )

    return asset
