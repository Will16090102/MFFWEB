import React, { useEffect, useState } from "react";

type Props = {
  onSubmit: (text: string) => void;
  placeholder?: string;
  initialText?: string;
  maxChars?: number;
  draftKey?: string;
  autoFocus?: boolean;
  onCancelReply?: () => void;
  isReplying?: boolean;
};

const Composer: React.FC<Props> = ({
  onSubmit,
  placeholder = "Escribe un comentario...",
  initialText = "",
  maxChars = 500,
  draftKey = "comments:draft",
  autoFocus = false,
  onCancelReply,
  isReplying = false,
}) => {
  const [text, setText] = useState<string>(initialText);
  const [savedDraft, setSavedDraft] = useState(false);

  useEffect(() => {
    const d = window.localStorage.getItem(draftKey);
    if (d) setText(d);
  }, [draftKey]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (text) {
        window.localStorage.setItem(draftKey, text);
        setSavedDraft(true);
      } else {
        window.localStorage.removeItem(draftKey);
        setSavedDraft(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [text, draftKey]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
    window.localStorage.removeItem(draftKey);
    setSavedDraft(false);
  };

  const remaining = maxChars - text.length;

  return (
    <div className="composer">
      <textarea
        className="composer-textarea"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={maxChars}
        autoFocus={autoFocus}
        aria-label="Campo de comentario"
      />
      <div className="composer-row">
        <div className="composer-left">
          {isReplying && onCancelReply ? (
            <button className="btn-link" onClick={onCancelReply}>
              Cancelar
            </button>
          ) : null}
        </div>
        <div className="composer-right">
          <span className={`counter ${remaining < 0 ? "error" : ""}`}>
            {text.length}/{maxChars}
          </span>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!text.trim() || text.length > maxChars}
          >
            Publicar
          </button>
        </div>
      </div>
      {savedDraft ? <div className="draft">Borrador guardado</div> : null}
    </div>
  );
};

export default Composer;