panel.plugin("tablo/actions", {
  blocks: {
    actions: `
      <div class="tablo-block-actions" style="padding: var(--input-padding-multiline);">
        <div
          class="tablo-block-actions__action"
          :class="{
            'tablo-block-actions__action--button': true,
            'tablo-block-actions__action--primary': true && item.primary,
          }"
          v-for="item in content.actions"
        >{{ item.title || '[empty-title]' }}</div>
      </div>
    `,
  },
});
