import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Mention from '@tiptap/extension-mention';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, onBlur }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem,
      Mention.configure({
        HTMLAttributes: {
          class: 'text-brand hover:underline focus-visible:ring-brand',
        },
        suggestion: {
          items: () => [],
        },
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'border rounded p-2 min-h-[150px] focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  if (onBlur) {
    editor.on('blur', () => {
      onBlur(editor.getHTML());
    });
  }

  return <EditorContent editor={editor} />;
}