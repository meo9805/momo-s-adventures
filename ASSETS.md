# 素材策略

当前版本引入了 Recraft 生成的定制背景、部分动物和道具素材；Kenney Tiny Town 只作为少量兜底像素素材保留。缺失的动物/道具仍可后续继续用 Recraft 单独生成并替换同名文件。

## 已使用素材

- Recraft custom pixel assets
  - 文件：`public/images/recraft/`
  - 用途：月亮森林背景、Nico、图图、信封、胡萝卜灯，以及当前可用的兜底动物图。
  - 说明：这是为本项目生成的定制素材。公开仓库前不要放入 momo 的私人照片。

- Kenney Tiny Town
  - 来源：https://kenney.nl/assets/tiny-town
  - 文件：`public/assets/kenney-tiny-town/tilemap_packed.png`
  - 许可证：CC0 1.0，许可文件已放在 `public/assets/kenney-tiny-town/License.txt`
  - 用途：少量兜底花草、城市/鸟群等像素道具。

## 已调研但暂未引入

- OpenGameArt - Farming Set Pixel-Art
  - 来源：https://opengameart.org/content/farming-set-pixel-art
  - 许可证：CC0
  - 暂未使用原因：更偏农产品/道具，缺少当前画面最需要的树、草地和建筑。

- Kettoman / HelloRumin / Bloomseed 等 itch.io 农场素材
  - 暂未使用原因：画风不错，但许可证通常包含“不能原样转售/再分发素材包”或署名要求；如果项目要公开 GitHub，先以 CC0 素材为主更稳。

- OpenGameArt Pixel Fox / Pixel Rabbit
  - 已下载到本机临时调研目录，但没有放入 `public/`，也不会进 Git。
  - 暂未使用原因：它们是侧视动作条，质量不错，但和当前 top-down 童话场景不完全同向；后续如果要把游戏改成横版/侧视冒险，再接入更合适。

后续如果要换成更完整的素材包，优先顺序：

1. CC0：Kenney、OpenGameArt CC0、FreeGameSprites、Open Pixel Project。
2. 免费商用但不可转售素材包：Kettoman、HelloRumin 等页面明确许可的素材。
3. CC-BY：可以用，但要在本文件里补署名、作者、链接和许可证。
4. CC-BY-SA / GPL：谨慎使用，除非确认再分发和署名要求能接受。

推荐方向：

- 治愈像素风、16x16 或 32x32。
- Top-down / cozy / farming / animals / nature / plants 标签。
- 尽量一套素材包解决地形、动物、植物和 UI，不混太多作者。

照片素材放在 `public/photos/`。涉及 momo 的私人照片不要上传公开仓库，除非仓库保持 private。
