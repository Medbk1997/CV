// Configuration Tailwind (reprise à l'identique de l'ancien bloc tailwind.config du CDN).
// Après toute modification des classes dans index.html : npm run build:css
module.exports = {
  content: ['./index.html'],
darkMode:'class',theme:{extend:{fontFamily:{sans:['Ubuntu','ui-sans-serif','system-ui']},colors:{brand:{50:'#f7f3fa',100:'#efe7f5',500:'#4f2470',600:'#3c1656',700:'#2b0a3d'},indigo:{50:'#f7f3fa',100:'#efe7f5',200:'#ddcdea',300:'#c3a9d9',400:'#a07fc0',500:'#6e4292',600:'#4f2470',700:'#3c1656',800:'#2b0a3d',900:'#22072f',950:'#17051f'},violet:{50:'#f5eff7',100:'#e9d8ee',200:'#d2b4df',300:'#b68bc7',400:'#8c55a6',500:'#673c7f',600:'#512e64',700:'#3d204b',800:'#2b0a3d',900:'#21052f',950:'#16041f'}}}}

};
