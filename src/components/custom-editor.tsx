'use client';

import React, { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';

type CustomEditorProps = {
  onChange: (val: string) => void;
  value: string;
};

export default function CustomEditor({ onChange, value }: CustomEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getContent()) {
      editorRef.current.setContent(value);
    }
  }, [value]);

  return (
    <div className='w-full'>
      <Editor
        tinymceScriptSrc={'/assets/libs/tinymce/tinymce.min.js'}
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | blocks | fontsize ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link quickimage | help',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        }}
        onEditorChange={(newValue, editor) => {
          onChange(newValue);
        }}
      />
    </div>
  );
}
