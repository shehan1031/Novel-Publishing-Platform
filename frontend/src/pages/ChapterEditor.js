import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { createChapter, getChapterById, updateChapter } from "../services/chapterService";
import "../styles/chapterEditor.css";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px"];
const FONT_FAMILIES = ["Arial", "Georgia", "Tahoma", "Times New Roman", "Verdana"];

const ChapterEditor = () => {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const novelId = searchParams.get("novel");
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [activeFormats, setActiveFormats] = useState({});
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial");

  // Load chapter if editing
  useEffect(() => {
    if (chapterId) {
      const fetchChapter = async () => {
        const data = await getChapterById(chapterId);
        setTitle(data.title);
        editorRef.current.innerHTML = data.content;
      };
      fetchChapter();
    }
  }, [chapterId]);

  // Execute formatting command
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
    editorRef.current.focus();
  };

  // Update toolbar highlighting
  const updateActiveFormats = () => {
    const formats = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      orderedList: document.queryCommandState("insertOrderedList"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      blockquote: document.queryCommandValue("formatBlock") === "blockquote",
    };
    setActiveFormats(formats);
  };

  // Apply font-size safely
  const applyFontSize = (size) => {
    setFontSize(size);
    document.execCommand("fontSize", false, "7"); // Use size 7 as dummy
    const fontElements = editorRef.current.querySelectorAll("font[size='7']");
    fontElements.forEach((el) => {
      el.removeAttribute("size");
      el.style.fontSize = size;
    });
    updateActiveFormats();
    editorRef.current.focus();
  };

  // Apply font-family
  const applyFontFamily = (family) => {
    setFontFamily(family);
    document.execCommand("fontName", false, family);
    updateActiveFormats();
    editorRef.current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const chapterData = {
        title,
        content: editorRef.current.innerHTML,
      };
      if (chapterId) {
        await updateChapter(chapterId, chapterData);
      } else {
        await createChapter({ novel: novelId, ...chapterData });
      }
      navigate(`/author/novel/${novelId}`);
    } catch (err) {
      console.error("Failed to save chapter:", err);
    }
  };

  return (
    <div className="chapter-editor-container">
      <h2>{chapterId ? "Edit Chapter" : "New Chapter"}</h2>

      <input
        type="text"
        placeholder="Chapter Title"
        className="chapter-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="editor-toolbar">
        <button
          className={activeFormats.bold ? "active" : ""}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("bold")}
        >
          B
        </button>
        <button
          className={activeFormats.italic ? "active" : ""}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("italic")}
        >
          I
        </button>
        <button
          className={activeFormats.underline ? "active" : ""}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("underline")}
        >
          U
        </button>
        <button
          className={activeFormats.orderedList ? "active" : ""}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("insertOrderedList")}
        >
          OL
        </button>
        <button
          className={activeFormats.unorderedList ? "active" : ""}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("insertUnorderedList")}
        >
          UL
        </button>
        <button
          className={activeFormats.blockquote ? "active" : ""}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("formatBlock", "BLOCKQUOTE")}
        >
          ❝
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("undo")}>
          ↺
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("redo")}>
          ↻
        </button>

        <select value={fontSize} onChange={(e) => applyFontSize(e.target.value)}>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <select value={fontFamily} onChange={(e) => applyFontFamily(e.target.value)}>
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={editorRef}
        className="editor-area"
        contentEditable
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
      />

      <button className="submit-chapter-btn" onClick={handleSubmit}>
        {chapterId ? "Update Chapter" : "Create Chapter"}
      </button>
    </div>
  );
};

export default ChapterEditor;
