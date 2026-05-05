"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Redo, Undo } from 'lucide-react'
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2],
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "focus:outline-none min-h-[200px] px-3 py-2 text-sm text-white/90 leading-relaxed [&_p]:my-2 [&_strong]:text-white [&_strong]:font-semibold [&_em]:italic [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-3 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:space-y-1 [&_li]:marker:text-[#C6A85E] [&_blockquote]:border-l-2 [&_blockquote]:border-[#C6A85E] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-2 [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className={cn("border border-white/10 rounded-md bg-black/20 overflow-hidden", className)}>
            <div className="flex items-center gap-1 p-1 border-b border-white/10 bg-white/5">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    className="h-8 w-8 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 hover:text-white"
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    className="h-8 w-8 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 hover:text-white"
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 2 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className="h-8 w-8 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 hover:text-white"
                >
                    <Heading2 className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    className="h-8 w-8 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 hover:text-white"
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    className="h-8 w-8 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 hover:text-white"
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />

                <Toggle
                    size="sm"
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    className="h-8 w-8 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 hover:text-white"
                >
                    <Quote className="h-4 w-4" />
                </Toggle>

                <div className="flex-1" />

                <Toggle
                    size="sm"
                    onPressedChange={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
                >
                    <Undo className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    onPressedChange={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
                >
                    <Redo className="h-4 w-4" />
                </Toggle>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}
