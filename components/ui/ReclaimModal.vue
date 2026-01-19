<script setup lang="ts">
import { LockPasswordIcon, Cancel01Icon } from 'hugeicons-vue'
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
  account: string
  isUserOwned: boolean
}>()

const emit = defineEmits(['close', 'confirm'])
const privateKey = ref('')

function confirm() {
  if (!privateKey.value) return
  emit('confirm', privateKey.value)
  privateKey.value = ''
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="w-full max-w-md bg-[#050505] border border-[#cc5500] shadow-[0_0_50px_rgba(204,85,0,0.1)]">
      <div class="px-6 py-4 bg-[#cc5500] text-black flex justify-between items-center">
        <h3 class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <LockPasswordIcon size="18" /> Authorize Reclaim
        </h3>
        <button @click="emit('close')" class="hover:text-white transition-colors"><Cancel01Icon size="18" /></button>
      </div>
      
      <div class="p-8">
        <div v-if="isUserOwned" class="mb-6 p-4 bg-blue-900/20 border border-blue-900/50 text-blue-200 text-xs leading-relaxed">
          <strong class="block uppercase tracking-widest mb-1 text-blue-400">User Owned Account</strong>
          You are attempting to close an account owned by a user. You must provide the <strong>User's Private Key</strong> to authorize this transaction. The Kora Node key will not work.
        </div>
        <div v-else class="mb-6 text-gray-400 text-xs leading-relaxed">
          Enter the <strong>Authority Private Key</strong> (Kora Node) to sign the closure transaction for account:
          <br><code class="text-[#cc5500]">{{ account }}</code>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Private Key (Base58 or JSON)</label>
          <textarea 
            v-model="privateKey"
            rows="3"
            class="w-full bg-[#111] border border-gray-800 p-3 text-gray-300 font-mono text-xs focus:border-[#cc5500] focus:outline-none transition-colors resize-none"
            placeholder="Enter private key..."
          ></textarea>
        </div>

        <p class="mt-4 text-[10px] text-gray-600 italic">
          <span class="text-red-500">*</span> Key is used for signing only and is never stored.
        </p>

        <div class="grid grid-cols-2 gap-4 mt-8">
          <button @click="emit('close')" class="py-3 border border-gray-800 text-gray-400 font-bold uppercase text-xs hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            @click="confirm" 
            :disabled="!privateKey"
            class="py-3 bg-[#cc5500] text-black font-bold uppercase text-xs hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign & Reclaim
          </button>
        </div>
      </div>
    </div>
  </div>
</template>