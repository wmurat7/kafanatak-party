// tools/apply-madde-13.cjs
// Madde 13: Aileler Yarışıyor - Kapalı Kutu & Sunucu Kontrol Mantığı Düzeltmesi

const fs = require('fs');
const path = require('path');

const ayPath = path.join(__dirname, '..', 'js', 'aileler-yarisiyor-game.js');
let content = fs.readFileSync(ayPath, 'utf8');

console.log('🚀 Madde 13: Aileler Yarışıyor Pano ve Sunucu Mantığı Güncelleniyor...');

// 1. renderBoardView içindeki pano ve sunucu cevap alanını baştan yapılandır
const newBoardTileLogic = `    // 1. Stüdyo TV Panosu (Yarışmacıların Gördüğü Kapalı/Açık Kutular)
    const boardTiles = q.answers.map((ans, idx) => {
      const isRevealed = !!this.revealedAnswers[idx];
      return \`
        <div class="ay-board-tile" data-idx="\${idx}" style="background:\${isRevealed ? 'linear-gradient(135deg, #064E3B, #0F172A)' : 'linear-gradient(135deg, rgba(30,27,75,0.7), rgba(15,23,42,0.9))'}; border:2px solid \${isRevealed ? '#10B981' : 'rgba(251,191,36,0.35)'}; border-radius:14px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; min-height:54px; transition:all 0.25s ease; box-shadow:\${isRevealed ? '0 0 16px rgba(16,185,129,0.35)' : '0 4px 12px rgba(0,0,0,0.3)'};">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:30px; height:30px; border-radius:50%; background:\${isRevealed ? '#10B981' : 'rgba(251,191,36,0.2)'}; color:\${isRevealed ? '#FFF' : '#FBBF24'}; font-weight:900; font-size:0.9rem; display:flex; align-items:center; justify-content:center; border:1.5px solid \${isRevealed ? '#10B981' : 'rgba(251,191,36,0.5)'};">
              \${idx + 1}
            </span>
            <div style="text-align:left;">
              <span style="font-size:1.02rem; font-weight:900; color:\${isRevealed ? '#FFF' : '#94A3B8'}; letter-spacing:\${isRevealed ? '0.5px' : '2px'};">
                \${isRevealed ? ans.text : '🔒 KAPALI KUTU'}
              </span>
            </div>
          </div>
          <div style="background:\${isRevealed ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}; color:\${isRevealed ? '#0B0E14' : '#64748B'}; font-weight:900; font-size:1.1rem; padding:4px 12px; border-radius:10px; font-family:monospace; min-width:44px; text-align:center;">
            \${isRevealed ? ans.points : '??'}
          </div>
        </div>
      \`;
    });

    // 2. Sunucu / Hakem Kontrol Listesi (Sunucunun cevapları görerek tek tıkla açtığı özel alan)
    const hostActionList = q.answers.map((ans, idx) => {
      const isRevealed = !!this.revealedAnswers[idx];
      return \`
        <div style="display:flex; justify-content:space-between; align-items:center; background:\${isRevealed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'}; border:1px solid \${isRevealed ? '#10B981' : 'rgba(255,255,255,0.15)'}; border-radius:10px; padding:6px 10px; margin-bottom:5px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.8rem; font-weight:900; color:\${isRevealed ? '#10B981' : 'var(--gold)'};">\${idx + 1}.</span>
            <span style="font-size:0.88rem; font-weight:800; color:#FFF; text-decoration:\${isRevealed ? 'line-through' : 'none'}; opacity:\${isRevealed ? '0.6' : '1'};">\${ans.text}</span>
            <span style="font-size:0.75rem; color:var(--gold); font-weight:900;">(\${ans.points}P)</span>
          </div>
          <button type="button" class="btn-host-open-tile" data-idx="\${idx}" style="background:\${isRevealed ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10B981, #059669)'}; color:\${isRevealed ? '#94A3B8' : '#FFF'}; border:none; border-radius:8px; font-size:0.75rem; font-weight:900; padding:5px 10px; cursor:\${isRevealed ? 'default' : 'pointer'};" \${isRevealed ? 'disabled' : ''}>
            \${isRevealed ? '✓ Açıldı' : '👁️ Panoda Aç'}
          </button>
        </div>
      \`;
    });`;

// Regex ile boardTiles bloğunu yenisiyle değiştir
content = content.replace(/\/\/\s*Panodaki cevap kutuları[\s\S]*?const boardTiles = q\.answers\.map[\s\S]*?\}\);\s*\}\);/, newBoardTileLogic);

// Soru altındaki Rehber ve Kontrol Alanını Sunucu Kartı ile donat
const oldHostGuide = `<div style="background:rgba(0,245,212,0.08); border:1px solid rgba(0,245,212,0.3); border-radius:12px; padding:10px 14px; text-align:left; font-size:0.75rem; color:#E2E8F0; line-height:1.45;">
          <strong style="color:var(--primary);">💡 Moderatör Rehberi:</strong> Yarışmacı yukarıdaki gizli cevaplardan birini bildiğinde o kutuya doğrudan dokunarak panoda açabilirsiniz. Eğer yanlış/alakasız cevap verdiyse kırmızı <strong>+1 Çarpı Ekle</strong> butonuna basın.
        </div>`;

const newHostControlPanel = `<!-- SUNUCU / HAKEM GİZLİ CEVAP KONTROL KARTI (Madde 13 Mantık Çözümü) -->
        <div style="background:linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.95)); border:2px solid var(--gold); border-radius:16px; padding:12px; margin-bottom:12px; text-align:left; box-shadow:0 0 20px rgba(251,191,36,0.15);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.82rem; font-weight:900; color:var(--gold); display:flex; align-items:center; gap:5px;">
              <span>🎙️</span> <span>SUNUCU CEVAP KONTROLÜ (Gizli):</span>
            </span>
            <span style="font-size:0.7rem; color:#94A3B8; font-weight:700;">Yarışmacı söylerse "Panoda Aç"a bas</span>
          </div>
          
          <div id="ay-host-answers-list">
            \${hostActionList.join('')}
          </div>
        </div>

        <div style="background:rgba(0,245,212,0.08); border:1px solid rgba(0,245,212,0.3); border-radius:12px; padding:10px 14px; text-align:left; font-size:0.75rem; color:#E2E8F0; line-height:1.45;">
          <strong style="color:var(--primary);">💡 Sunucu Kılavuzu:</strong> Panodaki kutular yarışmacılar için kapalıdır. Yarışmacı doğru cevabı seslendirdiğinde yukarıdaki sarı listeden <strong>"👁️ Panoda Aç"</strong> butonuna dokunarak panoda açabilirsiniz. Eğer alakasız cevap verilirse kırmızı butona basıp çarpı verin!
        </div>`;

content = content.replace(oldHostGuide, newHostControlPanel);

// bindBoardEvents içine btn-host-open-tile dinleyicilerini bağla
const oldBindBoard = `document.querySelectorAll('.ay-board-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this.revealAnswer(idx);
      });
    });`;

const newBindBoard = `// Sunucu cevap açma butonları
    document.querySelectorAll('.btn-host-open-tile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this.revealAnswer(idx);
      });
    });

    // Panodaki kutulara tıklayarak da açma desteği
    document.querySelectorAll('.ay-board-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this.revealAnswer(idx);
      });
    });`;

content = content.replace(oldBindBoard, newBindBoard);

fs.writeFileSync(ayPath, content, 'utf8');
console.log('🎉 Madde 13 başarıyla uygulandı!');

