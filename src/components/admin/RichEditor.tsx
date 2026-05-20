import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, Image as ImgIcon, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type Props = { value: string; onChange: (v: string) => void };

export const RichEditor = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg my-4 max-w-full" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm sm:prose-base max-w-none min-h-[300px] focus:outline-none p-4",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const Btn = ({ on, active, children, label }: { on: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <Button
      type="button" variant="ghost" size="sm" aria-label={label}
      onClick={on}
      className={`h-8 w-8 p-0 ${active ? "bg-brand-gradient text-white" : ""}`}
    >
      {children}
    </Button>
  );

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-muted/20">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/5 bg-muted/40">
        <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="w-3.5 h-3.5" /></Btn>
        <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="w-3.5 h-3.5" /></Btn>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <Btn label="H2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="w-3.5 h-3.5" /></Btn>
        <Btn label="H3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="w-3.5 h-3.5" /></Btn>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <Btn label="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="w-3.5 h-3.5" /></Btn>
        <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="w-3.5 h-3.5" /></Btn>
        <Btn label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="w-3.5 h-3.5" /></Btn>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <Btn label="Link" on={() => {
          const url = window.prompt("URL?");
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}><LinkIcon className="w-3.5 h-3.5" /></Btn>
        <Btn label="Image URL" on={() => {
          const url = window.prompt("Image URL?");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}><ImgIcon className="w-3.5 h-3.5" /></Btn>
        <div className="ml-auto flex gap-1">
          <Btn label="Undo" on={() => editor.chain().focus().undo().run()}><Undo className="w-3.5 h-3.5" /></Btn>
          <Btn label="Redo" on={() => editor.chain().focus().redo().run()}><Redo className="w-3.5 h-3.5" /></Btn>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
