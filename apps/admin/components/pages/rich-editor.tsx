"use client"

import { useEffect, useRef } from "react"
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichEditor({
  content,
  onChange,
  placeholder = "متن خود را اینجا بنویسید...",
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content
      }
    }
    isInternalChange.current = false
  }, [content])

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInsertLink = () => {
    const url = prompt("آدرس لینک:")
    if (url) exec("createLink", url)
  }

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }

  const ToolBtn = ({ icon: Icon, onClick, title }: { icon: any; onClick: () => void; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolBtn icon={Undo2} onClick={() => exec("undo")} title="بازگشت" />
        <ToolBtn icon={Redo2} onClick={() => exec("redo")} title="از نو" />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolBtn icon={Heading1} onClick={() => exec("formatBlock", "h2")} title="عنوان ۱" />
        <ToolBtn icon={Heading2} onClick={() => exec("formatBlock", "h3")} title="عنوان ۲" />
        <ToolBtn icon={Heading3} onClick={() => exec("formatBlock", "h4")} title="عنوان ۳" />
        <ToolBtn icon={List} onClick={() => exec("formatBlock", "p")} title="پاراگراف" />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolBtn icon={Bold} onClick={() => exec("bold")} title="بولد" />
        <ToolBtn icon={Italic} onClick={() => exec("italic")} title="ایتالیک" />
        <ToolBtn icon={Underline} onClick={() => exec("underline")} title="زیرخط" />
        <ToolBtn icon={Strikethrough} onClick={() => exec("strikeThrough")} title="خط‌خورده" />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolBtn icon={Quote} onClick={() => exec("formatBlock", "blockquote")} title="نقل قول" />
        <ToolBtn icon={Code} onClick={() => exec("formatBlock", "pre")} title="کد" />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolBtn icon={List} onClick={() => exec("insertUnorderedList")} title="لیست نامرتب" />
        <ToolBtn icon={ListOrdered} onClick={() => exec("insertOrderedList")} title="لیست مرتب" />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolBtn icon={LinkIcon} onClick={handleInsertLink} title="درج لینک" />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[300px] p-4 text-sm text-foreground outline-none"
      />

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        [contenteditable] h3 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        [contenteditable] h4 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        [contenteditable] p { margin: 0.5rem 0; line-height: 1.8; }
        [contenteditable] ul, [contenteditable] ol { margin: 0.5rem 0; padding-right: 1.5rem; }
        [contenteditable] ul { list-style: disc; }
        [contenteditable] ol { list-style: decimal; }
        [contenteditable] li { margin: 0.25rem 0; }
        [contenteditable] blockquote {
          border-right: 4px solid hsl(var(--primary));
          padding-right: 1rem;
          margin: 1rem 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        [contenteditable] pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          direction: ltr;
          text-align: left;
          margin: 1rem 0;
        }
        [contenteditable] a { color: hsl(var(--primary)); text-decoration: underline; }
        [contenteditable] strong { font-weight: 700; }
        [contenteditable] em { font-style: italic; }
      `}</style>
    </div>
  )
}
