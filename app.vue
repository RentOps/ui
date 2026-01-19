<template>
  <div class="min-h-screen bg-black text-white font-oswald selection:bg-[#cc5500] selection:text-black">
    <NuxtPage />
  </div>
</template>

<style>
@font-face {
  font-family: 'Oswald';
  src: url('/Oswald/Oswald-VariableFont_wght.ttf') format('truetype');
  font-weight: 200 700;
  font-display: swap;
}

body {
  margin: 0;
  background-color: #000000;
  font-family: 'Oswald', sans-serif;
  overflow-x: hidden;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #050505;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #222;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cc5500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
