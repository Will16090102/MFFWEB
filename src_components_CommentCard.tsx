import React from "react";
import { Comment } from "../types";
import { formatTimeAgo } from "../utils";

type Props = {
  comment: Comment;
  depth?: number;
  onLike: (id: string) => void;
  onReply: (comment: Comment) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
};

const Avatar: React.FC<{ name: string; color?: string; size?: number }> = ({
  name,
  color = "#2b6cb0",
  size = 40,
}) => {
  const initials = name
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <div
      className="avatar"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
      }}
      title={`Avatar de ${name}`}
    >
      {initials}
    </div>
  );
};

const CommentCard: React.FC<Props> = ({
  comment,
  depth = 0,
  onLike,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const isMine = comment.user.id === currentUserId;

  const handleMore = () => {
    if (isMine) {
      const choice = window.prompt("Acción: escribir 'editar' o 'eliminar' (dejar vacío para cancelar)");
      if (!choice) return;
      if (choice.toLowerCase() === "editar") {
        onEdit(comment.id, comment.text);
      } else if (choice.toLowerCase() === "eliminar") {
        const ok = window.confirm("¿Eliminar comentario?");
        if (ok) onDelete(comment.id);
      }
    } else {
      const choice = window.prompt("Acción: escribir 'reportar' o 'copiar' (dejar vacío para cancelar)");
      if (!choice) return;
      if (choice.toLowerCase() === "reportar") {
        alert("Reportado. Gracias.");
      } else if (choice.toLowerCase() === "copiar") {
        const url = `${window.location.href}#comment-${comment.id}`;
        navigator.clipboard?.writeText(url);
        alert("Enlace copiado al portapapeles.");
      }
    }
  };

  return (
    <div
      className="comment-card"
      id={`comment-${comment.id}`}
      style={depth > 0 ? { marginLeft: 16 * depth, borderLeft: "2px solid #f1f5f9", paddingLeft: 10 } : {}}
    >
      <div className="comment-top">
        <Avatar name={comment.user.name} color={comment.user.avatarColor} />
        <div className="comment-meta">
          <div className="comment-meta-top">
            <strong>{comment.user.name}</strong>
            <span className="time"> · {formatTimeAgo(comment.createdAt)}</span>
            {comment.pendingModeration ? <span className="pending"> · Pendiente</span> : null}
          </div>
          <div className="comment-text">{comment.text}</div>
        </div>
      </div>

      <div className="comment-actions">
        <button className={`action ${comment.likedByMe ? "liked" : ""}`} onClick={() => onLike(comment.id)}>
          ❤️ {comment.likes}
        </button>
        <button className="action" onClick={() => onReply(comment)}>
          Responder
        </button>
        <button className="action" onClick={handleMore}>
          •••
        </button>
      </div>

      {comment.replies &&
        comment.replies.map((r) => (
          <CommentCard
            key={r.id}
            comment={r}
            depth={Math.min(depth + 1, 2)}
            onLike={onLike}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUserId={currentUserId}
          />
        ))}
    </div>
  );
};

export default CommentCard;