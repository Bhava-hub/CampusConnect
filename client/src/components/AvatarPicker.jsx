import doge from '../assets/avatar-doge.jpg';
import llama from '../assets/avatar-llama.jpg';
import alpaca from '../assets/avatar-alpaca.jpg';
import cat from '../assets/avatar-cat.jpg';
import monkey from '../assets/avatar-monkey.jpg';
import frog from '../assets/avatar-frog.jpg';
import fox from '../assets/avatar-fox.jpg';
import penguin from '../assets/avatar-penguin.jpg';

export const AVATARS = [
  { id: 'doge', name: 'Doge', src: doge },
  { id: 'llama', name: 'Llama', src: llama },
  { id: 'alpaca', name: 'Alpaca', src: alpaca },
  { id: 'cat', name: 'Coughing Cat', src: cat },
  { id: 'monkey', name: 'Thinking Monkey', src: monkey },
  { id: 'frog', name: 'Headphone Frog', src: frog },
  { id: 'fox', name: 'Scholar Fox', src: fox },
  { id: 'penguin', name: 'Penguin', src: penguin },
];

export function getAvatarSrc(idOrName) {
  if (!idOrName) return AVATARS[0].src;
  const found = AVATARS.find(a => a.id === idOrName || a.name.toLowerCase() === String(idOrName).toLowerCase());
  return found ? found.src : AVATARS[0].src;
}

export function AvatarDisplay({ avatarId, size = 36, style = {}, className = '', alt = 'User avatar' }) {
  const src = getAvatarSrc(avatarId);
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        imageRendering: 'pixelated',
        border: '2px solid var(--navy)',
        background: 'var(--card)',
        flexShrink: 0,
        display: 'inline-block',
        ...style,
      }}
    />
  );
}

export function AvatarPicker({ selected = 'doge', onSelect }) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.25rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <legend style={{
          fontFamily: "'Pixelify Sans', monospace",
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--navy)',
        }}>
          Choose Your Avatar
        </legend>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted-fg)', fontFamily: "'Silkscreen', monospace" }}>
          {AVATARS.find(a => a.id === selected)?.name || 'Doge'}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.6rem',
      }}>
        {AVATARS.map((avatar) => {
          const isSelected = selected === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              id={`avatar-option-${avatar.id}`}
              aria-label={`Choose ${avatar.name} avatar`}
              aria-pressed={isSelected}
              title={avatar.name}
              onClick={() => onSelect(avatar.id)}
              style={{
                position: 'relative',
                aspectRatio: '1/1',
                padding: '0.25rem',
                border: isSelected ? '2px solid var(--orange)' : '2px solid var(--navy)',
                background: isSelected ? 'var(--orange-soft)' : 'var(--card)',
                boxShadow: isSelected ? '0 0 0 2px var(--orange)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <img
                src={avatar.src}
                alt={avatar.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                }}
              />
              {isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '18px',
                    height: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--mint)',
                    borderLeft: '2px solid var(--navy)',
                    borderTop: '2px solid var(--navy)',
                    color: 'var(--navy)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default AvatarPicker;
