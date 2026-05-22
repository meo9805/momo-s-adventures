# Recraft Prompts for momo 的月亮森林

## 统一风格 Prompt

Use this as the base style for every generation:

```text
Cozy top-down pixel art for a romantic healing farming RPG, crisp 16-bit pixel art, orthographic 3/4 top-down view, hand-placed tile details, warm moonlit forest atmosphere, clean silhouettes, readable small characters, charming but not childish, consistent limited palette: deep navy night sky, muted blue shadows, warm peach moonlight, soft pink highlights, fox orange accents, lavender UI mood, cream highlights, moss green grass, earthy brown paths. Pixel-perfect edges, no blur, no anti-aliasing, no painterly texture, no vector look, no 3D, no photorealism, no text, no letters, no numbers, no watermark.
```

## 1. Shell Background

File name: `public/images/recraft/moon-forest-shell.png`

Recommended size: `860 x 1360` PNG, then I can downscale/crop if needed.

```text
Create a vertical mobile game background for a cozy top-down pixel art romantic forest game.

Scene: moonlit forest farm at night, soft blue-purple sky at the top, warm square pixel stars, distant treetops, a gentle grass clearing, tiny flowers, dirt path curves, small farm/nature details around the edges. The middle should feel like a playable cozy RPG scene. Keep the center readable and calm.

Composition requirements:
- vertical mobile composition
- background must cover the top HUD area, progress bar area, and central game canvas area
- top 160 pixels should be low-contrast sky and treetop texture so white/pink UI text can sit above it
- middle area can contain forest clearing, grass tiles, flowers, path, tiny props
- push decoration to the edges, keep center clean for characters
- no large objects behind where progress text such as 1/5 would appear
- no text, no numbers, no logos

Style: use the unified style prompt. Crisp pixel art, 16x16 tile feeling, not blurry.
```

## 2. Chapter Backgrounds

Generate these as separate vertical backgrounds, each `780 x 1120` or `390 x 560` PNG.

### Nico / 北美赤狐

```text
Top-down cozy pixel art chapter background. A moonlit residential garden with a small warm house corner, grass clearing, flower patches, a dirt path, and a quiet envelope pickup spot. This is for Nico, a North American red fox. Leave clear open space in the lower-middle for the fox sprite and one envelope prop. Decoration stays near edges. No text, no numbers.
```

### 图图和嘟嘟 / 棕色兔子农场

```text
Top-down cozy pixel art chapter background. A small moonlit vegetable garden and rabbit farm corner, brown soil crop beds, carrot leaves, tiny fence pieces, warm lantern spots, soft flowers, grass. Two brown rabbits will stand in the lower-middle. Keep paths clean, no visual clutter, no text, no numbers.
```

### 姊姊和妹妹 / 蜜袋鼯树冠

```text
Top-down cozy pixel art chapter background. A moonlit tree canopy scene with branch platforms, soft leaves, hanging vines, small glowing moon shards, quiet forest floor below. It should feel safe and dreamy. Leave open air spaces for two sugar glider sprites, one white and one mottled grey-brown. No text, no numbers.
```

### 小咪和小小咪 / 小区楼下

```text
Top-down cozy pixel art chapter background. A quiet apartment entrance at night, warm window lights, small doorstep, planted shrubs, a few memory photo card spots on the ground, soft grass edge. It should feel like the moment a kitten comes over to rub against someone. Leave space for a black-white cow cat and a tiny young brown tabby kitten. No text, no numbers.
```

### 二七广场 / 月光回忆

```text
Top-down cozy pixel art chapter background. A romantic simplified city square memory at night inspired by Zhengzhou Erqi Square, with a warm plaza floor, distant tower silhouette, soft moonlight, many small birds/pigeons as simple pixel shapes, but keep it gentle and not crowded. Leave center clean for interaction. No readable signs, no text, no numbers.
```

## 3. Animal Sprite Sheet

File name: `public/images/recraft/sprites-animals.png`

Recommended generation: transparent background, sprite sheet, each sprite around `48 x 48` to `64 x 64`, export large PNG without smoothing.

```text
Create a transparent-background pixel art sprite sheet in a consistent cozy top-down farming RPG style. All animals should share the same lighting, outline thickness, scale, and pixel resolution. 3/4 top-down view, cute but natural, readable silhouettes, crisp pixel edges.

Sprites needed:
1. Nico: North American red fox, red-orange coat, white chest, white tail tip, black legs, alert ears, gentle expression.
2. 图图: warm brown rabbit, rounded body, long ears, soft beige muzzle, calm expression.
3. 嘟嘟: darker brown rabbit, same species and scale as 图图, slightly deeper coat color.
4. 姊姊: white sugar glider, tiny body, big dark eyes, soft gliding membrane visible, sweet expression.
5. 妹妹: normal mottled grey-brown sugar glider, same size as 姊姊, visible gliding membrane.
6. 小咪: black-and-white cow cat, black patches, white chest, friendly standing pose.
7. 小小咪: very young brown tabby kitten, about one month old, smaller than 小咪, round head, short legs, tabby stripes.

Include one idle pose and one tiny walking/turning pose for each animal. Keep each sprite separated with transparent padding. No background, no text, no labels, no watermark.
```

## 4. Props Sprite Sheet

File name: `public/images/recraft/sprites-props.png`

```text
Create a transparent-background pixel art prop sprite sheet in the same cozy top-down farming RPG style.

Props:
- cream envelope with warm orange seal
- glowing moon shard, small collectible, peach and cream light
- carrot lantern, cute farm lantern, warm orange glow
- photo memory card placeholder, dark navy border, cream inner frame
- small pixel flowers, grass tufts, mushrooms
- small fence pieces
- tiny warm window light tiles
- soft square sparkle particles

Consistent scale, crisp pixel edges, limited palette, no text, no labels, no watermark.
```

## 5. Negative Prompt

Use this on every Recraft generation if a negative prompt field is available:

```text
blurry, smooth gradients, anti-aliased edges, realistic animal photo, semi-realistic painting, 3D render, vector icon, flat corporate illustration, watercolor, oil painting, anime portrait, large eyes covering face, messy composition, over-detailed background, unreadable tiny noise, text, numbers, logo, watermark, UI labels, speech bubbles
```

## 6. Export Notes

- Export as PNG.
- Keep sprites transparent.
- Do not export JPG for pixel art.
- Disable smoothing/upscaling if Recraft offers that option.
- If Recraft outputs a large image, keep the large PNG. I will crop and scale it inside the project.

## 7. Current One-Shot Image Prompt

Use this when generating the next replacement batch for 姊姊妹妹、兔子、鸟群、最终月亮:

```text
Use the uploaded forest background only as style and palette reference. Generate isolated transparent PNG game assets, not full scenes.

Overall style for every asset:
cozy 16-bit pixel art, Stardew-Valley-like RPG sprite, crisp hard square pixel edges, no blur, no anti-aliasing, transparent background, already cropped with small transparent padding, readable at small mobile game size, 3/4 top-down RPG view where suitable, matching this palette: deep navy night, lavender purple shadows, cream moonlight, soft pink highlights, warm peach accents, moss green and earthy brown. Cute but natural, not toy-like, not anime mascot.

Asset 1: Zizi, white sugar glider
One small white sugar glider, visible gliding membrane between front and back legs, tiny rounded body, small ears, dark eyes but not oversized, gentle expression, standing or gliding low above the ground. Around 64x64 to 96x96 sprite feeling.

Asset 2: Meimei, mottled grey-brown sugar glider
One small normal mottled grey-brown sugar glider, same scale as Zizi, visible gliding membrane, soft brown-grey patches, small ears, dark eyes but not oversized, sweet natural expression, slightly different pose from Zizi. Around 64x64 to 96x96 sprite feeling.

Asset 3: Tutu and Dudu, brown rabbits
Two separate brown rabbits with clear transparent padding between them for cropping. One lighter caramel-brown rabbit, one darker chocolate-brown rabbit. Not white rabbits. Long ears, small round bodies, tiny paws, soft cream muzzle highlights, relaxed garden pose. Around 64x64 to 96x96 sprite feeling each.

Asset 4: pigeon group
Seven separate small grey-white pigeons arranged in a neat grid with clear transparent padding. Different simple poses: standing, side view, wings slightly open, mid-flap, turning, flying upward, tiny landing pose. Each bird should be clean and readable at 24x24 to 40x40 sprite size.

Asset 5: final full moon
One complete full round moon, unbroken, not a crescent, not a shard, not a crystal. Soft cream moon with subtle pale pink and lavender pixel patches, no face, no eyes, no smile. Centered isolated prop, 96x96 to 160x160 sprite feeling.

Negative prompt:
blurry, soft airbrush, smooth gradients, anti-aliased vector, 3D render, photorealistic, semi-realistic painting, watercolor, anime mascot, chibi toy, oversized glossy eyes, plush toy, sticker style, thick cartoon outline, messy background, full scene, landscape background, floor, UI, text, labels, watermark, logo
```
