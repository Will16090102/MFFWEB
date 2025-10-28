import React, { useCallback, useMemo, useState } from "react";
import Composer from "./Composer";
import CommentCard from "./CommentCard";
import { Comment, User } from "../types";
import { uid } from "../utils";

type Props = {
  initialComments?: Comment[];
  currentUser: User;
};

const SORT_OPTIONS = ["Más recientes", "Más votados", "Destacados"];

const CommentList: React.FC<Props> = ({ initialComments = [], currentUser }) => {
  const [comments, setComments] = useState<Comment[]>(
    initialComments.length ? initialComments : sampleComments(currentUser)
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      const more = generateDummyBatch(currentUser, 4);
      setComments((c) => [...c, ...more]);
      setLoadingMore(false);
    }, 700);
  }, [loadingMore, currentUser]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setComments((c) => [...generateDummyBatch(currentUser, 2), ...c]);
      setRefreshing(false);
    }, 700);
  };

  const handleSubmit = (text: string) => {
    const newComment: Comment = {
      id: uid("c_"),
      user: currentUser,
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    };
    if (sort === "Más recientes") {
      setComments((c) => [newComment, ...c]);
    } else {
      setComments((c) => [...c, newComment]);
    }
    setReplyTo(null);
  };

  const handleReply = (parent: Comment) => {
    setReplyTo(parent);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleLike = (id: string) => {
    const updateLike = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === id) {
          const liked = !c.likedByMe;
          return { ...c, likedByMe: liked, likes: c.likes + (liked ? 1 : -1) };
        }
        if (c.replies) return { ...c, replies: updateLike(c.replies) };
        return c;
      });

    setComments((c) => updateLike(c));
  };

  const handleEdit = (id: string, originalText: string) => {
    const newText = window.prompt("Editar comentario", originalText);
    if (newText === null) return;
    const updateText = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === id) return { ...c, text: newText };
        if (c.replies) return { ...c, replies: updateText(c.replies) };
        return c;
      });
    setComments((c) => updateText(c));
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("¿Eliminar comentario?");
    if (!ok) return;
    const deleteRec = (list: Comment[]): Comment[] =>
      list
        .filter((c) => c.id !== id)
        .map((c) => (c.replies ? { ...c, replies: deleteRec(c.replies) } : c));
    setComments((c) => deleteRec(c));
  };

  const onSubmitReply = (text: string) => {
    if (!replyTo) return;
    const reply: Comment = {
      id: uid("r_"),
      user: currentUser,
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    };

    const insertReply = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === replyTo.id) {
          const replies = c.replies ? [reply, ...c.replies] : [reply];
          return { ...c, replies };
        }
        if (c.replies) return { ...c, replies: insertReply(c.replies) };
        return c;
      });

    setComments((c) => insertReply(c));
    setReplyTo(null);
  };

  const sorted = useMemo(() => {
    const copy = [...comments];
    if (sort === "Más recientes") {
      return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    if (sort === "Más votados") {
      return copy.sort((a, b) => b.likes - a.likes);
    }
    return copy.sort((a, b) => {
      const score = (c: Comment) => c.likes * 2 + (c.replies ? c.replies.length : 0);
      return score(b) - score(a);
    });
  }, [comments, sort]);

  return (
    <div className="comment-list-root">
      <header className="cl-header">
        <h1>Comentarios</h1>
        <div className="sort-row">
          <label htmlFor="sort">Orden:</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="btn-link" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </header>

      <div className="composer-wrap">
        <Composer onSubmit={handleSubmit} placeholder="Escribe un comentario público..." draftKey="global:draft:main" />
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <p>Aún no hay comentarios. Sé el primero.</p>
          <button className="btn-primary" onClick={() => { /* focus would go to composer */ }}>
            Comentar
          </button>
        </div>
      ) : (
        <div className="comments-container">
          {sorted.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              onLike={handleLike}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={currentUser.id}
            />
          ))}
          <div className="load-more">
            <button className="btn-secondary" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Cargando..." : "Cargar más"}
            </button>
          </div>
        </div>
      )}

      {replyTo ? (
        <div className="reply-composer">
          <div className="replying-to">Respondiendo a {replyTo.user.name}</div>
          <Composer
            onSubmit={onSubmitReply}
            placeholder={`Responder a ${replyTo.user.name}...`}
            draftKey={`draft:reply:${replyTo.id}`}
            isReplying
            onCancelReply={() => setReplyTo(null)}
            autoFocus
          />
        </div>
      ) : null}
    </div>
  );
};

export default CommentList;

/* ---- helpers for demo ---- */
const sampleComments = (me: User): Comment[] => [
  {
    id: uid("c_"),
    user: { id: "u1", name: "Laura Gómez", avatarColor: "#ef4444" },
    text: "Buena idea, coincido con lo propuesto. Hay que probar en móviles.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 12,
    likedByMe: false,
    replies: [
      {
        id: uid("r_"),
        user: { id: "u2", name: "Carlos Ruiz", avatarColor: "#06b6d4" },
        text: "Totalmente, mejor si hacemos pruebas en Android e iOS.",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        likes: 3,
        likedByMe: false,
      },
    ],
  },
  {
    id: uid("c_"),
    user: me,
    text: "Prueba de comentario del usuario actual.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    likes: 1,
    likedByMe: true,
  },
];

const generateDummyBatch = (me: User, n = 3): Comment[] =>
  Array.from({ length: n }).map((_, i) => ({
    id: uid("c_"),
    user: { id: `u${Math.random().toString(36).slice(2, 6)}`, name: `User ${i + 1}` },
    text: `Comentario de prueba #${i + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(),
    likes: Math.floor(Math.random() * 10),
    likedByMe: false,
  }));