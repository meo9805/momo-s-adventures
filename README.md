# momo 的月亮森林

520 互动童话小游戏，手机优先。

项目目录：`/Users/meo/Desktop/momo 历险记`

GitHub Pages 地址部署后会是：

```text
https://meo9805.github.io/momo-s-adventures/
```

## 运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 让对方玩到

最省事的方式是打开 GitHub Pages：

1. 把代码推到 `meo9805/momo-s-adventures` 的 `main` 分支。
2. GitHub Actions 会自动构建 `dist` 并部署到 Pages。
3. 如果第一次没有自动开启，到仓库 `Settings -> Pages`，把 Source 设成 `GitHub Actions`。
4. 等 Actions 跑完，把上面的 Pages 链接发给对方。

如果暂时不能公网访问，也可以本机局域网试玩：

```bash
npm run dev
```

然后把终端里显示的 Network 地址发给同一个 Wi-Fi 下的手机或电脑。

## 后续补照片

照片先放在 `public/photos/`，第一版画面里已经有“照片待补充”的记忆卡。建议先补三张：

- 小区里买姊姊妹妹
- 楼下小咪主动蹭蹭
- 郑州二七广场鸟群

剧情和文案集中在 `src/story.ts`，后续可以只改这个文件。

## 素材授权

当前版使用 Recraft 生成的定制背景和部分动物/道具素材，文件在 `public/images/recraft/`。Kenney Tiny Town 仍作为少量兜底像素道具素材使用，来源记录在 `ASSETS.md`。
