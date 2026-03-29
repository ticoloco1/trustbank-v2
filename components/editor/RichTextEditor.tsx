'use client';
import { useRef, useState, useEffect } from 'react';
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
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [showLink, setShowLink]     = useState(false);
  const [showEmbed, setShowEmbed]   = useState(false);
  const [linkUrl, setLinkUrl]       = useState('');
  const [embedUrl, setEmbedUrl]     = useState('');
  const savedRange = useRef<Range | null>(null);

  // Sync only on mount — avoids focus loss on every keystroke
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []); // eslint-disable-line

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const sync = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Strip formatting on paste — clean HTML for SEO
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
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
      exec('insertHTML', `<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0;display:block;" />`);
    } catch {}
    setUploading(false);
  };

  const insertEmbed = () => {
    if (!embedUrl) return;
    // Auto-convert YouTube watch URLs to embed URLs
    let finalUrl = embedUrl;
    if (embedUrl.includes('youtube.com/watch?v=')) {
      finalUrl = embedUrl.replace('watch?v=', 'embed/');
    } else if (embedUrl.includes('youtu.be/')) {
      const id = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (id) finalUrl = `https://www.youtube.com/embed/${id}`;
    } else if (embedUrl.includes('vimeo.com/')) {
      const id = embedUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      if (id) finalUrl = `https://player.vimeo.com/video/${id}`;
    }

    restoreRange();
    const html = `<div class="video-container" style="margin:20px 0;border-radius:12px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0;">
      <iframe src="${finalUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe>
    </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    setShowEmbed(false);
    setEmbedUrl('');
    sync();
  };

  const btn: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 6, border: 'none',
    background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text2)',
  };
  const sep = <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 3px', alignSelf: 'center' }} />;
  const modal: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 16,
  };
  const box: React.CSSProperties = {
    background: '#1d2128', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24, padding: 32, width: '100%', maxWidth: 440,
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  };
  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)',
    color: '#f1f5f9', fontSize: 14, outline: 'none', marginBottom: 16,
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:2, padding:'8px 10px', borderBottom:'1px solid var(--border)', background:'var(--bg2)', alignItems:'center' }}>
        <button style={btn} onClick={() => exec('formatBlock','h1')} title="H1"><Heading1 size={14}/></button>
        <button style={btn} onClick={() => exec('formatBlock','h2')} title="H2"><Heading2 size={14}/></button>
        {sep}
        <button style={btn} onClick={() => exec('bold')} title="Bold"><Bold size={14}/></button>
        <button style={btn} onClick={() => exec('italic')} title="Italic"><Italic size={14}/></button>
        <button style={btn} onClick={() => exec('underline')} title="Underline"><Underline size={14}/></button>
        {sep}
        <button style={btn} onClick={() => exec('justifyLeft')}><AlignLeft size={14}/></button>
        <button style={btn} onClick={() => exec('justifyCenter')}><AlignCenter size={14}/></button>
        <button style={btn} onClick={() => exec('justifyRight')}><AlignRight size={14}/></button>
        {sep}
        <button style={btn} onClick={() => exec('insertUnorderedList')}><List size={14}/></button>
        <button style={btn} onClick={() => exec('insertOrderedList')}><ListOrdered size={14}/></button>
        <button style={btn} onClick={() => exec('formatBlock','blockquote')}><Quote size={14}/></button>
        <button style={btn} onClick={() => exec('formatBlock','pre')}><Code size={14}/></button>
        <button style={btn} onClick={() => exec('insertHorizontalRule')}><Minus size={14}/></button>
        {sep}
        <button style={btn} onClick={() => { saveRange(); setShowLink(true); }}><Link2 size={14}/></button>
        <button style={{ ...btn, color:'#60a5fa' }} onClick={() => { saveRange(); setShowEmbed(true); }}><Video size={14}/></button>
        <label style={{ ...btn, cursor:'pointer' }}>
          {uploading ? <Loader2 size={13} className="animate-spin"/> : <ImageIcon size={13}/>}
          <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files?.[0]; if(f) insertImage(f); }}/>
        </label>
      </div>

      {/* Editor — direction:ltr fixes RTL text bug */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        onInput={sync}
        onPaste={onPaste}
        data-placeholder={placeholder || 'Write content here...'}
        style={{ minHeight:260, padding:'16px 20px', outline:'none', color:'var(--text)', fontSize:15, lineHeight:1.8, direction:'ltr', textAlign:'left' }}
      />

      {/* Link modal */}
      {showLink && (
        <div style={modal}>
          <div style={box}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20, alignItems:'center' }}>
              <p style={{ fontWeight:800, color:'#f1f5f9', margin:0, fontSize:18 }}>Insert Link</p>
              <button onClick={() => setShowLink(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><X size={20}/></button>
            </div>
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." style={inp}
              onKeyDown={e => { if(e.key==='Enter') { restoreRange(); exec('createLink', linkUrl); setShowLink(false); setLinkUrl(''); }}}/>
            <button onClick={() => { restoreRange(); exec('createLink', linkUrl); setShowLink(false); setLinkUrl(''); }}
              style={{ width:'100%', padding:'14px', background:'#818cf8', border:'none', borderRadius:14, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:15 }}>
              Insert
            </button>
          </div>
        </div>
      )}

      {/* Embed modal */}
      {showEmbed && (
        <div style={modal}>
          <div style={box}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
              <p style={{ fontWeight:900, color:'#f1f5f9', margin:0, fontSize:20 }}>Embed Video</p>
              <button onClick={() => setShowEmbed(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><X size={20}/></button>
            </div>
            <p style={{ fontSize:13, color:'rgba(241,245,249,0.4)', marginBottom:16 }}>YouTube or Vimeo URL — auto-converted to embed</p>
            <input value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inp}
              onKeyDown={e => { if(e.key==='Enter') insertEmbed(); }}/>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={insertEmbed} style={{ flex:1, padding:'14px', background:'#fff', border:'none', borderRadius:14, color:'#000', fontWeight:900, cursor:'pointer', fontSize:15 }}>
                EMBED VIDEO
              </button>
              <button onClick={() => setShowEmbed(false)} style={{ padding:'14px 20px', background:'transparent', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)', fontWeight:700 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before{content:attr(data-placeholder);color:var(--text2);opacity:.35;}
        [contenteditable] h1{font-size:28px;font-weight:900;margin:16px 0 8px;line-height:1.2;}
        [contenteditable] h2{font-size:22px;font-weight:800;margin:14px 0 6px;}
        [contenteditable] blockquote{border-left:3px solid var(--accent);padding-left:16px;margin:12px 0;font-style:italic;opacity:.8;}
        [contenteditable] pre{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:monospace;font-size:13px;overflow-x:auto;}
        [contenteditable] ul,[contenteditable] ol{padding-left:24px;margin:8px 0;}
        [contenteditable] a{color:var(--accent);text-decoration:underline;}
        [contenteditable] img{max-width:100%;border-radius:8px;display:block;margin:8px 0;}
        [contenteditable] hr{border:none;border-top:1px solid var(--border);margin:16px 0;}
        [contenteditable] .video-container iframe{border-radius:12px;}
      `}</style>
    </div>
  );
}
