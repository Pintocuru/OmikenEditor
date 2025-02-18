// src/components/common/partsMySwal.ts
import Swal from 'sweetalert2';

// sweetalert2グローバル設定(z-indexを変更)
export const MySwal = Swal.mixin({
 willOpen: (popup) => {
  // スタイルシートを動的に追加
  const style = document.createElement('style');
  style.textContent = `
      .swal2-container {
        z-index: 10000 !important;
      }
      .swal2-popup {
        z-index: 10001 !important;
      }
      .swal2-backdrop {
        z-index: 9999 !important;
      }
      .swal2-confirm, .swal2-cancel, .swal2-deny, .swal2-input{
        color: white !important; 
      }
    `;
  document.head.appendChild(style);
 },
 //confirmButtonColor: '#F44336', // 第1ボタン:Material Red 500
 //denyButtonColor: '#2196F3', // 第2ボタン:Material Blue 500
 cancelButtonColor: '#9E9E9E' // キャンセル:Material Gray 500
});
