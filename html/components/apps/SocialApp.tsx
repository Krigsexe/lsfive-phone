
import React, { useState } from 'react';
import type { SocialPost } from '../../types';
import { useLocale } from '../../i18n';
import { Heart, MessageCircle, Send, PlusSquare, X } from 'lucide-react';

interface SocialAppProps {
    posts: SocialPost[];
    onCreatePost: (data: { imageUrl: string, caption: string }) => void;
    onLikePost: (postId: string) => void;
}

const CreatePostModal: React.FC<{
    onClose: () => void;
    onCreate: (data: { imageUrl: string, caption: string }) => void;
}> = ({ onClose, onCreate }) => {
    const { t } = useLocale();
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');

    const handleSubmit = () => {
        if (imageUrl && caption) {
            onCreate({ imageUrl, caption });
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-sm relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-xl font-bold text-white mb-4">{t('create_new_post')}</h2>
                <div className="space-y-4">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder={t('image_url_placeholder')}
                        className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder={t('caption_placeholder')}
                        rows={4}
                        className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!imageUrl || !caption}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-neutral-600"
                    >
                        {t('post_button')}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

const PostCard: React.FC<{ post: SocialPost; onLike: (id: string) => void }> = ({ post, onLike }) => {
    return (
        <div className="bg-neutral-900/80 rounded-xl overflow-hidden border border-neutral-800/50">
            <div className="flex items-center gap-3 p-3">
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full bg-neutral-700" />
                <div>
                    <p className="font-bold text-white">{post.authorName}</p>
                    <p className="text-xs text-neutral-400">{post.timestamp}</p>
                </div>
            </div>
            <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[450px] object-cover" />
            <div className="p-3">
                <div className="flex items-center gap-4">
                    <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 group">
                        <Heart
                            size={24}
                            className={`transition-all ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-white group-hover:text-red-400'}`}
                        />
                    </button>
                    <button className="text-white group"><MessageCircle size={24} className="group-hover:text-sky-400" /></button>
                    <button className="text-white group"><Send size={24} className="group-hover:text-green-400" /></button>
                </div>
                <p className="font-semibold text-sm mt-2">{post.likes.toLocaleString()} likes</p>
                <p className="text-white mt-1">
                    <span className="font-bold mr-1.5">{post.authorName}</span>
                    {post.caption}
                </p>
            </div>
        </div>
    );
};


const SocialApp: React.FC<SocialAppProps> = ({ posts, onCreatePost, onLikePost }) => {
    const { t } = useLocale();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="bg-transparent text-white h-full flex flex-col">
            <header className="p-4 bg-black/30 backdrop-blur-xl sticky top-0 z-10 border-b border-neutral-800 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{t('social_title')}</h1>
                <button onClick={() => setIsModalOpen(true)} className="p-2 text-white"><PlusSquare size={26} /></button>
            </header>
            <div className="flex-grow overflow-y-auto p-4">
                <div className="max-w-2xl mx-auto space-y-3">
                    {posts.map(post => <PostCard key={post.id} post={post} onLike={onLikePost} />)}
                </div>
            </div>
            {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} onCreate={onCreatePost} />}
        </div>
    );
};

export default SocialApp;