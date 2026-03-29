'use client';
import { useRef, useState } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Heading1, Heading2, Minus, Quote, Code,
  Link2, Video, Image as ImageIcon, X, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editorRef  = useRef<HTMLDivElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [showLink, setShowLink]     = useState(false);
  const [showEmbed, setShowEmbed]   = useState(false);
  const [linkUrl, setLinkUrl]       = useState('');
  const [embedUrl, setEmbedUrl]     = useState('');
  const savedRange = useRef<Range | null>(null);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    sync();
    editorRef.current?.focus();
  };

  const sync = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreRange = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  };

  const insertImage = async (file: File) => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const path = `${session?.user?.id}/pages/${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('platform-assets').upload(path, file, { upsert: true });
      const url = supabase.storage.from('platform-assets').getPublicUrl(path).data.publicUrl;
      exec('insertHTML', `<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
    } catch {}
    setUploading(false);
  };

  const insertEmbed = () => {
    const yt = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vm = embedUrl.match(/vimeo\.com\/(\d+)/);
    let html = '';
    if (yt) html = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen style="border-radius:8px;margin:8px 0;display:block;"></iframe>`;
    else if (vm) html = `<iframe width="100%" height="315" src="https://player.vimeo.com/video/${vm[1]}" frameborder="0" allowfullscreen style="border-radius:8px;margin:8px 0;display:block;"></iframe>`;
    else html = `<iframe src="${embedUrl}" width="100%" height="315" frameborder="0" style="border-radius:8px;margin:8px 0;display:block;"></iframe>`;
    restoreRange();
    exec('insertHTML', html);
    setShowEmbed(false);
    setEmbedUrl('');
  };

  const btn = {
    width: 30, height: 30, borderRadius: 6, border: 'none' as const,
    background: 'transparent', cursor: 'pointer' as const,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text2)',
  };
  const sep = <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px', alignSelf: 'center' as const }} />;
  const modal = { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
  const box = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: 360 };
  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' as const, fontFamily: 'inherit' };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', alignItems: 'center' }}>
        <button style={btn} onClick={() => exec('formatBlock','h1')} title="H1"><Heading1 size={14}/></button>
        <button style={btn} onClick={() => exec('formatBlock','h2')} title="H2"><Heading2 size={14}/></button>
        {sep}
        <button style={btn} onClick={() => exec('bold')} title="Bold"><Bold size={14}/></button>
        <button style={btn} onClick={() => exec('italic')} title="Italic"><Italic size={14}/></button>
        <button style={btn} onClick={() => exec('underline')} title="Underline"><Underline size={14}/></button>
        {sep}
        <button style={btn} onClick={() => exec('justifyLeft')} title="Left"><AlignLeft size={14}/></button>
        <button style={btn} onClick={() => exec('justifyCenter')} title="Center"><AlignCenter size={14}/></button>
        <button style={btn} onClick={() => exec('justifyRight')} title="Right"><AlignRight size={14}/></button>
        {sep}
        <button style={btn} onClick={() => exec('insertUnorderedList')} title="List"><List size={14}/></button>
        <button style={btn} onClick={() => exec('insertOrderedList')} title="Numbered"><ListOrdered size={14}/></button>
        <button style={btn} onClick={() => exec('formatBlock','blockquote')} title="Quote"><Quote size={14}/></button>
        <button style={btn} onClick={() => exec('formatBlock','pre')} title="Code"><Code size={14}/></button>
        <button style={btn} onClick={() => exec('insertHorizontalRule')} title="Line"><Minus size={14}/></button>
        {sep}
        <button style={btn} onClick={() => { saveRange(); setShowLink(true); }} title="Link"><Link2 size={14}/></button>
        <button style={btn} onClick={() => { saveRange(); setShowEmbed(true); }} title="Embed"><Video size={14}/></button>
        <label style={{ ...btn, cursor: 'pointer' }} title="Image">
          {uploading ? <Loader2 size={14} className="animate-spin"/> : <ImageIcon size={14}/>}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) insertImage(f); }}/>
        </label>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        onInput={sync}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder || 'Write content here...'}
        style={{ minHeight: 280, padding: '16px 20px', outline: 'none', color: 'var(--text)', fontSize: 15, lineHeight: 1.8, direction: 'ltr', textAlign: 'left' }}
      />

      {/* Link modal */}
      {showLink && (
        <div style={modal}>
          <div style={box}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
              <p style={{ fontWeight: 800, color: 'var(--text)', margin: 0 }}>Insert Link</p>
              <button onClick={() => setShowLink(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}><X size={18}/></button>
            </div>
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." style={inp}/>
            <button onClick={() => { restoreRange(); exec('createLink', linkUrl); setShowLink(false); setLinkUrl(''); }}
              style={{ width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Insert
            </button>
          </div>
        </div>
      )}

      {/* Embed modal */}
      {showEmbed && (
        <div style={modal}>
          <div style={box}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
              <p style={{ fontWeight: 800, color: 'var(--text)', margin: 0 }}>Embed Video</p>
              <button onClick={() => setShowEmbed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}><X size={18}/></button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>YouTube, Vimeo or iframe URL</p>
            <input value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inp}/>
            <button onClick={insertEmbed}
              style={{ width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Insert
            </button>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before{content:attr(data-placeholder);color:var(--text2);opacity:.4;}
        [contenteditable] h1{font-size:28px;font-weight:900;margin:16px 0 8px;}
        [contenteditable] h2{font-size:22px;font-weight:800;margin:14px 0 6px;}
        [contenteditable] blockquote{border-left:3px solid var(--accent);padding-left:16px;margin:12px 0;font-style:italic;opacity:.8;}
        [contenteditable] pre{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:monospace;font-size:13px;}
        [contenteditable] ul,[contenteditable] ol{padding-left:24px;margin:8px 0;}
        [contenteditable] a{color:var(--accent);text-decoration:underline;}
        [contenteditable] img{max-width:100%;border-radius:8px;}
        [contenteditable] hr{border:none;border-top:1px solid var(--border);margin:16px 0;}
      `}</style>
    </div>
  );
}
