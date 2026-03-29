'use client';
import { useRef, useState } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Heading1, Heading2, Minus, Quote, Code,
  Link2, Video, Image as ImageIcon, X, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const saved = useRef<Range | null>(null);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    sync();
  };
  const sync = () => { if (ref.current) onChange(ref.current.innerHTML); };
  const saveRange = () => {
    const s = window.getSelection();
    if (s && s.rangeCount > 0) saved.current = s.getRangeAt(0).cloneRange();
  };
  const restoreRange = () => {
    const s = window.getSelection();
    if (s && saved.current) { s.removeAllRanges(); s.addRange(saved.current); }
  };

  const uploadImage = async (file: File) => {
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

  const tools: any[] = [
    { icon: Heading1, fn: () => exec('formatBlock', 'h1'), title: 'H1' },
    { icon: Heading2, fn: () => exec('formatBlock', 'h2'), title: 'H2' },
    'sep',
    { icon: Bold, fn: () => exec('bold'), title: 'Bold' },
    { icon: Italic, fn: () => exec('italic'), title: 'Italic' },
    { icon: Underline, fn: () => exec('underline'), title: 'Underline' },
    'sep',
    { icon: AlignLeft, fn: () => exec('justifyLeft'), title: 'Left' },
    { icon: AlignCenter, fn: () => exec('justifyCenter'), title: 'Center' },
    { icon: AlignRight, fn: () => exec('justifyRight'), title: 'Right' },
    'sep',
    { icon: List, fn: () => exec('insertUnorderedList'), title: 'List' },
    { icon: ListOrdered, fn: () => exec('insertOrderedList'), title: 'Ordered' },
    { icon: Quote, fn: () => exec('formatBlock', 'blockquote'), title: 'Quote' },
    { icon: Code, fn: () => exec('formatBlock', 'pre'), title: 'Code' },
    { icon: Minus, fn: () => exec('insertHorizontalRule'), title: 'Divider' },
    'sep',
    { icon: Link2, fn: () => { saveRange(); setShowLink(true); }, title: 'Link' },
    { icon: Video, fn: () => { saveRange(); setShowEmbed(true); }, title: 'Embed' },
  ];

  const btn = { width:28, height:28, border:'none', background:'transparent', cursor:'pointer', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(241,245,249,0.6)' };
  const overlay = { position:'fixed' as const, inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 };
  const box = { background:'#161b22', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:24, width:360 };
  const inp = { width:'100%', padding:'10px 14px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'white', color:'#111827', fontSize:14, outline:'none', marginBottom:12, boxSizing:'border-box' as const };
  const submitBtn = { width:'100%', padding:12, background:'#818cf8', border:'none', borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 };

  return (
    <div style={{ border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:14, overflow:'hidden', direction:'ltr' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:1, padding:'8px 10px', background:'rgba(255,255,255,0.03)', borderBottom:'0.5px solid rgba(255,255,255,0.08)', alignItems:'center' }}>
        {tools.map((t, i) =>
          t === 'sep'
            ? <div key={i} style={{ width:1, height:20, background:'rgba(255,255,255,0.1)', margin:'0 3px' }} />
            : <button key={i} style={btn} title={t.title} onClick={t.fn}><t.icon size={13} /></button>
        )}
        <label style={{ ...btn, cursor:'pointer' }} title="Image">
          {uploading ? <Loader2 size={13} /> : <ImageIcon size={13} />}
          <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
        </label>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning dir="ltr"
        onInput={sync} dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder || 'Write content here...'}
        style={{ minHeight:260, padding:'16px 20px', outline:'none', color:'#f1f5f9', fontSize:15, lineHeight:1.8, direction:'ltr', textAlign:'left', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}
      />
      {showLink && (
        <div style={overlay}>
          <div style={box}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, alignItems:'center' }}>
              <span style={{ fontWeight:800, color:'#f1f5f9', fontSize:16 }}>Insert Link</span>
              <button onClick={() => setShowLink(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><X size={18} /></button>
            </div>
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." style={inp} />
            <button onClick={() => { restoreRange(); exec('createLink', linkUrl); setShowLink(false); setLinkUrl(''); }} style={submitBtn}>Insert</button>
          </div>
        </div>
      )}
      {showEmbed && (
        <div style={overlay}>
          <div style={box}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, alignItems:'center' }}>
              <span style={{ fontWeight:800, color:'#f1f5f9', fontSize:16 }}>Embed Video</span>
              <button onClick={() => setShowEmbed(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', marginBottom:10 }}>YouTube, Vimeo or iframe URL</p>
            <input value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inp} />
            <button onClick={insertEmbed} style={submitBtn}>Insert</button>
          </div>
        </div>
      )}
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:rgba(241,245,249,0.25);}[contenteditable] h1{font-size:28px;font-weight:900;margin:16px 0 8px;}[contenteditable] h2{font-size:22px;font-weight:800;margin:14px 0 6px;}[contenteditable] blockquote{border-left:3px solid #818cf8;padding-left:16px;margin:12px 0;opacity:.8;font-style:italic;}[contenteditable] pre{background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;font-family:monospace;font-size:13px;}[contenteditable] ul,[contenteditable] ol{padding-left:24px;margin:8px 0;}[contenteditable] a{color:#818cf8;text-decoration:underline;}[contenteditable] img{max-width:100%;border-radius:8px;}[contenteditable] hr{border:none;border-top:0.5px solid rgba(255,255,255,0.15);margin:16px 0;}`}</style>
    </div>
  );
}
