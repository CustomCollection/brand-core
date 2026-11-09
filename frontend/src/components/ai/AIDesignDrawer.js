'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Plus,
  Coins,
  Send,
  Image as ImageIcon,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  MessageSquare,
  Maximize2,
  Shirt,
  Info,
} from 'lucide-react';
import useAIChat from '@/hooks/useAIChat';
import { cn } from '@/lib/utils';

export default function AIDesignDrawer({
  isOpen,
  onClose,
  activePlacement = 'fr',
  placementLabel = 'Front',
  onUseArtwork, // Callback when user clicks 'Use It'
}) {
  const {
    conversations,
    activeChatId,
    setActiveChatId,
    activeConversation,
    tokenBalance,
    isLoadingChats,
    isLoadingConversation,
    isGenerating,
    error,
    createNewChat,
    deleteChat,
    deleteArtwork,
    sendMessage,
  } = useAIChat();

  const [promptInput, setPromptInput] = useState('');
  const [referenceFile, setReferenceFile] = useState(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [usedArtworkId, setUsedArtworkId] = useState(null);

  const fileInputRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isGenerating]);

  // Handle reference file pick (single reference image rule)
  const handleReferencePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Reference image size must be under 15MB.');
      return;
    }

    setReferenceFile(file);
    const url = URL.createObjectURL(file);
    setReferencePreviewUrl(url);
  };

  const removeReferenceImage = () => {
    setReferenceFile(null);
    if (referencePreviewUrl) {
      URL.revokeObjectURL(referencePreviewUrl);
      setReferencePreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit prompt
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    const currentPrompt = promptInput.trim();
    const currentRefFile = referenceFile;

    setPromptInput('');
    removeReferenceImage();

    try {
      await sendMessage(currentPrompt, currentRefFile);
    } catch (err) {
      // Error is captured in useAIChat
    }
  };

  // Handle "Use It" click
  const handleUseArtwork = (artwork) => {
    if (!artwork?.image_url) return;
    setUsedArtworkId(artwork.id);
    onUseArtwork(artwork.image_url, artwork.width || 1024, artwork.height || 1024);
    setTimeout(() => {
      setUsedArtworkId(null);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background dismissal backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Panel */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 shadow-2xl flex flex-col h-full border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-300 z-10">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>AI Design Studio</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 uppercase">
                  Multi-Turn
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Active Placement: <span className="font-bold text-orange-600 dark:text-orange-400">{placementLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Daily Token Balance Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-bold">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{tokenBalance.available_tokens} Tokens</span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-normal">
                (5 free daily)
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Body Layout: Chat Threads History (Left) + Active Workspace (Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Conversations History Sidebar */}
          <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/50 dark:bg-neutral-950/20">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => createNewChat('New Design Chat')}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Design Chat</span>
              </button>
            </div>

            {/* Conversation Threads List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingChats ? (
                <div className="flex items-center justify-center py-8 text-neutral-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs text-neutral-400">
                  No design chats yet. Start a new one!
                </div>
              ) : (
                conversations.map((chat) => {
                  const isActive = activeChatId === chat.id;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={cn(
                        'group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all',
                        isActive
                          ? 'bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 font-bold text-orange-900 dark:text-orange-200 shadow-2xs'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate mr-1">
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400 group-hover:text-orange-500" />
                        <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this design conversation?')) {
                            deleteChat(chat.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Active Chat Stream & Generation Results */}
          <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900">
            {/* Scrollable Messages Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Empty Starter State */}
              {(!activeConversation?.messages || activeConversation.messages.length === 0) && (
                <div className="text-center py-12 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    Describe Your Apparel Artwork
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                    Our AI models will refine your prompt, generate transparent 300 DPI graphics, and let you apply them instantly to your garment.
                  </p>

                  {/* Suggestion Chips */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                      Try prompt suggestions:
                    </span>
                    {[
                      'Cyberpunk wolf howling at neon moon with glowing geometric lines',
                      'Minimalist line art mountain sunset badge with clean borders',
                      '90s vintage anime hero typography graphic for streetwear',
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptInput(suggestion)}
                        className="w-full text-left p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 text-xs text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              {activeConversation?.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs',
                      msg.role === 'user'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-tr-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-xs'
                    )}
                  >
                    {/* User Reference Image (if attached) */}
                    {msg.reference_image_url && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-white/20 bg-black/10 p-1">
                        <span className="text-[10px] font-semibold text-neutral-300 dark:text-neutral-600 block px-1 mb-1">
                          Attached Reference:
                        </span>
                        <img
                          src={msg.reference_image_url}
                          alt="Reference preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Assistant Generated Image & 'Use It' Action Card */}
                    {msg.generated_image_url && (
                      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700/80">
                        <div className="relative group rounded-xl overflow-hidden bg-neutral-950 border border-neutral-700 shadow-md">
                          <img
                            src={msg.generated_image_url}
                            alt="Generated Design"
                            className="w-full max-h-72 object-contain bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]"
                          />

                          {/* Quick Lightbox Zoom */}
                          <button
                            type="button"
                            onClick={() => setSelectedImagePreview(msg.generated_image_url)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                            title="Expand view"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Action Bar with 'Use It' Button */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-[11px] text-neutral-400">
                            Transparent Print Graphic
                          </div>

                          {/* "USE IT" BUTTON */}
                          <button
                            type="button"
                            onClick={() =>
                              handleUseArtwork({
                                id: msg.id,
                                image_url: msg.generated_image_url,
                                width: 1024,
                                height: 1024,
                              })
                            }
                            className={cn(
                              'py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer',
                              usedArtworkId === msg.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md'
                            )}
                          >
                            {usedArtworkId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Applied to {placementLabel}!</span>
                              </>
                            ) : (
                              <>
                                <Shirt className="w-3.5 h-3.5" />
                                <span>Use on {placementLabel}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Generating Animation Loader */}
              {isGenerating && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-xs p-4 text-xs text-neutral-600 dark:text-neutral-300 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                      <span>Creating print-ready artwork...</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Preparing prompt with LLM and synthesizing 300 DPI graphic via diffusion pipeline.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Generation Input Area */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30">
              {/* Single Reference Image Chip (if attached) */}
              {referencePreviewUrl && (
                <div className="mb-2 flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 w-fit">
                  <img
                    src={referencePreviewUrl}
                    alt="Ref preview"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                    Reference Image Attached
                  </span>
                  <button
                    type="button"
                    onClick={removeReferenceImage}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hidden Reference Image File Picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleReferencePick}
              />

              <form onSubmit={handleGenerate} className="flex items-center gap-2">
                {/* Reference Image Trigger Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach 1 Reference Image"
                  className={cn(
                    'p-3 rounded-xl border transition-colors cursor-pointer flex-shrink-0',
                    referenceFile
                      ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/40'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  )}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Main Prompt Text Input */}
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe your design (e.g. Vintage synthwave astronaut on transparent background)..."
                  className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  disabled={isGenerating}
                />

                {/* Submit Generate Button */}
                <button
                  type="submit"
                  disabled={!promptInput.trim() || isGenerating}
                  className="py-3 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer flex-shrink-0"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Generate</span>
                </button>
              </form>

              {/* Footer Guidance Note */}
              <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 px-1">
                <span>1 Generation = 1 Token • Max 1 reference image</span>
                <span>Replenishes to 5 tokens daily at 00:00 IST</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={selectedImagePreview}
              alt="Zoomed Design"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedImagePreview(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-black shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
