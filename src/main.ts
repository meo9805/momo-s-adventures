import Phaser from "phaser";
import "./styles.css";
import { Chapter, STORY } from "./story";

type UiState = {
  chip: string;
  title: string;
  text: string;
  actionLabel: string;
  actionEnabled: boolean;
  fragments: number;
};

type Bridge = {
  update: (state: UiState) => void;
  finish: () => void;
};

type HotspotTarget = Phaser.GameObjects.GameObject & {
  x: number;
  y: number;
  displayWidth?: number;
  displayHeight?: number;
  active: boolean;
};

type Hotspot = {
  target: HotspotTarget;
  radius: number;
  active: boolean;
  onTap: () => void;
};

const WORLD_WIDTH = 390;
const WORLD_HEIGHT = 560;
const TOTAL_FRAGMENTS = STORY.chapters.length;
const ASSET_BASE = import.meta.env.BASE_URL;
const assetUrl = (path: string) => `${ASSET_BASE}${path.replace(/^\//, "")}`;

const colors = {
  black: 0x000000,
  night: 0x1a1a2e,
  deepBlue: 0x16213e,
  muted: 0x2a2a4e,
  moon: 0xe8dff5,
  peach: 0xffd4a3,
  pink: 0xffb5c0,
  fox: 0xff8c42,
  lavender: 0xb4a5d5,
  cream: 0xfef9ef,
  earth: 0x8b6f47,
  grass: 0x7cb882,
  forest: 0x4a7c59
};

const ui = {
  intro: document.querySelector<HTMLElement>("#intro")!,
  startButton: document.querySelector<HTMLButtonElement>("#start-button")!,
  soundButton: document.querySelector<HTMLButtonElement>("#sound-button")!,
  primaryAction: document.querySelector<HTMLButtonElement>("#primary-action")!,
  dialogTitle: document.querySelector<HTMLElement>("#dialog-title")!,
  dialogText: document.querySelector<HTMLElement>("#dialog-text")!,
  stageChip: document.querySelector<HTMLElement>("#stage-chip")!,
  progressFill: document.querySelector<HTMLElement>("#progress-fill")!,
  progressText: document.querySelector<HTMLElement>("#progress-text")!,
  ending: document.querySelector<HTMLElement>("#ending")!,
  endingLines: document.querySelector<HTMLElement>("#ending-lines")!,
  restartButton: document.querySelector<HTMLButtonElement>("#restart-button")!
};

document.documentElement.style.setProperty(
  "--scene-backdrop",
  `url("${assetUrl("images/recraft/moon-forest-shell.png")}")`
);

class AmbientPlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private active = false;

  async toggle() {
    if (this.active) {
      this.stop();
      return false;
    }
    await this.start();
    return true;
  }

  private async start() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    await this.ctx.resume();
    this.gain = this.ctx.createGain();
    this.gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.gain.gain.exponentialRampToValueAtTime(0.055, this.ctx.currentTime + 1.2);
    this.gain.connect(this.ctx.destination);

    const notes = [196, 246.94, 293.66];
    this.oscillators = notes.map((freq, index) => {
      const oscillator = this.ctx!.createOscillator();
      const tremolo = this.ctx!.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      tremolo.gain.value = index === 0 ? 0.22 : 0.12;
      oscillator.connect(tremolo);
      tremolo.connect(this.gain!);
      oscillator.start();
      return oscillator;
    });
    this.active = true;
  }

  private stop() {
    if (!this.ctx || !this.gain) return;
    this.gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
    window.setTimeout(() => {
      this.oscillators.forEach((oscillator) => oscillator.stop());
      void this.ctx?.close();
      this.ctx = null;
      this.gain = null;
      this.oscillators = [];
    }, 450);
    this.active = false;
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class MoonForestScene extends Phaser.Scene {
  private bridge: Bridge;
  private stageIndex = 0;
  private fragments = 0;
  private stageComplete = false;
  private activeChapter!: Chapter;
  private stageGroup!: Phaser.GameObjects.Group;
  private timers: Phaser.Time.TimerEvent[] = [];
  private activeObjects: Phaser.GameObjects.GameObject[] = [];
  private hotspots: Hotspot[] = [];
  private dialogLines: string[] = [];
  private dialogIndex = 0;
  private dialogDone: (() => void) | null = null;

  constructor(bridge: Bridge) {
    super("MoonForestScene");
    this.bridge = bridge;
  }

  preload() {
    this.load.image("moon-forest-shell", assetUrl("images/recraft/moon-forest-shell.png"));
    this.load.image("nico", assetUrl("images/recraft/animal-nico.png"));
    this.load.image("rabbit-brown", assetUrl("images/recraft/animal-rabbit-tutu.png"));
    this.load.image("rabbit-dark", assetUrl("images/recraft/animal-rabbit-dudu.png"));
    this.load.image("glider-white", assetUrl("images/recraft/animal-glider-zizi.png"));
    this.load.image("glider-mottle", assetUrl("images/recraft/animal-glider-meimei.png"));
    this.load.image("cat-cow", assetUrl("images/recraft/animal-cat-xiaomi.png"));
    this.load.image("cat-tabby", assetUrl("images/recraft/animal-cat-xiaoxiaomi.png"));
    this.load.image("envelope", assetUrl("images/recraft/prop-envelope.png"));
    this.load.image("carrot-lantern", assetUrl("images/recraft/prop-carrot-lantern.png"));
  }

  create() {
    this.cameras.main.setBackgroundColor(colors.deepBlue);
    this.createTextures();
    this.showStage(0);
  }

  primaryAction() {
    if (this.dialogLines.length > 0) {
      this.advanceDialogLine();
      return;
    }
    if (!this.stageComplete) {
      this.exploreCurrentChapter();
      return;
    }
    if (this.stageIndex >= STORY.chapters.length - 1) {
      this.bridge.finish();
      return;
    }
    this.showStage(this.stageIndex + 1);
  }

  restart() {
    this.stageIndex = 0;
    this.fragments = 0;
    this.showStage(0);
  }

  tapAt(worldX: number, worldY: number) {
    this.handleStageTap(worldX, worldY);
  }

  private showStage(index: number) {
    this.stageIndex = index;
    this.stageComplete = false;
    this.dialogLines = [];
    this.dialogDone = null;
    this.dialogIndex = 0;
    this.activeChapter = STORY.chapters[index];
    this.clearStage();
    this.drawBaseScene();

    switch (this.activeChapter.id) {
      case "nico":
        this.drawNicoStage();
        break;
      case "rabbits":
        this.drawRabbitStage();
        break;
      case "gliders":
        this.drawGliderStage();
        break;
      case "cats":
        this.drawCatStage();
        break;
      case "plaza":
        this.drawPlazaStage();
        break;
    }

    this.input.on("pointerdown", this.handlePointerDown, this);
    this.updateUi(this.activeChapter.instruction, "继续故事", true);
  }

  private clearStage() {
    this.input.removeAllListeners("pointerdown");
    this.hotspots = [];
    this.timers.forEach((timer) => timer.remove(false));
    this.timers = [];
    this.activeObjects.forEach((object) => object.destroy());
    this.activeObjects = [];
    if (this.stageGroup) {
      this.stageGroup.clear(true, true);
    }
    this.stageGroup = this.add.group();
  }

  private addToStage<T extends Phaser.GameObjects.GameObject>(object: T) {
    this.stageGroup.add(object);
    return object;
  }

  private updateUi(text: string, label: string, enabled: boolean) {
    this.bridge.update({
      chip: this.activeChapter.chip,
      title: this.activeChapter.title,
      text,
      actionLabel: label,
      actionEnabled: enabled,
      fragments: this.fragments
    });
  }

  private completeStage(text = this.activeChapter.completeText) {
    if (this.stageComplete) return;
    this.dialogLines = [];
    this.dialogDone = null;
    this.dialogIndex = 0;
    this.stageComplete = true;
    this.fragments = Math.max(this.fragments, this.stageIndex + 1);
    this.addMoonBurst(332, 58);
    this.updateUi(text, this.stageIndex === STORY.chapters.length - 1 ? "打开告白" : "下一章", true);
    this.haptic();
  }

  private exploreCurrentChapter() {
    const linesByChapter = {
      nico: STORY.nicoLines,
      rabbits: STORY.rabbitLines,
      gliders: STORY.gliderLines,
      cats: STORY.catLines,
      plaza: STORY.plazaLines
    };
    this.startDialogSequence(linesByChapter[this.activeChapter.id], () => this.completeStage());
  }

  private startDialogSequence(lines: string[], done: () => void) {
    this.dialogLines = lines;
    this.dialogIndex = 0;
    this.dialogDone = done;
    this.updateUi(lines[0], lines.length > 1 ? "下一句" : "收下月光", true);
  }

  private advanceDialogLine() {
    this.dialogIndex += 1;
    if (this.dialogIndex < this.dialogLines.length) {
      const isLast = this.dialogIndex === this.dialogLines.length - 1;
      this.updateUi(this.dialogLines[this.dialogIndex], isLast ? "收下月光" : "下一句", true);
      return;
    }

    const done = this.dialogDone;
    this.dialogLines = [];
    this.dialogDone = null;
    this.dialogIndex = 0;
    done?.();
  }

  private haptic() {
    if ("vibrate" in navigator) {
      navigator.vibrate(18);
    }
  }

  private drawBaseScene() {
    this.addCoverImage("moon-forest-shell");
    const shade = this.addToStage(this.add.graphics());
    shade.fillStyle(colors.night, 0.12);
    shade.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.drawMoonProgress();
    this.addChapterTitle();
  }

  private addCoverImage(key: string) {
    const image = this.addToStage(this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, key).setOrigin(0.5));
    const scale = Math.max(WORLD_WIDTH / image.width, WORLD_HEIGHT / image.height);
    image.setScale(scale);
    image.setDepth(-100);
    return image;
  }

  private addAsset(key: string, x: number, y: number, maxWidth: number, maxHeight: number) {
    const image = this.addToStage(this.add.image(x, y, key).setOrigin(0.5));
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
    image.setScale(scale);
    return image;
  }

  private addGroundGlow(x: number, y: number, width: number, height: number, alpha = 0.26) {
    const glow = this.addToStage(this.add.graphics());
    glow.fillStyle(colors.black, alpha);
    glow.fillEllipse(x, y, width, height);
    glow.setDepth(y - 20);
    return glow;
  }

  private addMemorySign(x: number, y: number, text: string) {
    const sign = this.addToStage(this.add.container(x, y));
    sign.setDepth(y + 20);
    const g = this.add.graphics();
    g.fillStyle(colors.black, 0.78);
    g.fillRect(-80, -20, 160, 40);
    g.fillStyle(colors.night, 0.96);
    g.fillRect(-84, -24, 160, 40);
    g.lineStyle(3, colors.black, 1);
    g.strokeRect(-84, -24, 160, 40);
    sign.add(g);
    sign.add(
      this.add
        .text(0, -3, text, {
          fontFamily: '"Press Start 2P", "Noto Sans SC", monospace',
          fontSize: "8px",
          color: "#fef9ef",
          align: "center"
        })
        .setOrigin(0.5)
    );
    return sign;
  }

  private drawMoonProgress() {
    const g = this.addToStage(this.add.graphics());
    g.fillStyle(colors.black, 0.82);
    g.fillRect(306, 28, 58, 58);
    g.fillStyle(colors.moon, 0.24);
    g.fillRect(312, 34, 46, 46);
    g.lineStyle(3, colors.black, 1);
    g.strokeRect(312, 34, 46, 46);

    const lit = this.fragments / TOTAL_FRAGMENTS;
    if (lit > 0) {
      g.fillStyle(colors.pink, 0.35 + lit * 0.5);
      g.fillRect(317, 39 + (1 - lit) * 36, 36, lit * 36);
    }

    this.addToStage(
      this.add
        .text(335, 57, `${this.fragments}/${TOTAL_FRAGMENTS}`, {
          fontFamily: '"Press Start 2P", "Noto Sans SC", monospace',
          fontSize: "9px",
          color: "#fef9ef"
        })
        .setOrigin(0.5)
    );
  }

  private addChapterTitle() {
    const g = this.addToStage(this.add.graphics());
    g.fillStyle(colors.black, 0.82);
    g.fillRect(23, 24, 278, 76);
    g.fillStyle(colors.night, 0.96);
    g.fillRect(18, 19, 278, 76);
    g.lineStyle(3, colors.black, 1);
    g.strokeRect(18, 19, 278, 76);
    this.addToStage(
      this.add
        .text(34, 38, this.activeChapter.title, {
          fontFamily: '"Press Start 2P", "Noto Sans SC", monospace',
          fontSize: "11px",
          color: "#e8dff5",
          align: "center"
        })
        .setOrigin(0, 0)
    );
    this.addToStage(
      this.add
        .text(34, 65, this.activeChapter.subtitle, {
          fontFamily: '"Silkscreen", "Noto Sans SC", monospace',
          fontSize: "11px",
          color: "#b4a5d5",
          align: "left",
          wordWrap: { width: 240 }
        })
        .setOrigin(0, 0)
    );
  }

  private drawNicoStage() {
    this.addGroundGlow(146, 484, 146, 34);
    this.addGroundGlow(276, 398, 96, 26, 0.2);
    const nico = this.addAsset("nico", 136, 438, 92, 92);
    nico.setDepth(438);
    const envelope = this.addAsset("envelope", 276, 358, 72, 56);
    envelope.setDepth(458);
    const prompt = this.addToStage(
      this.add
        .text(276, 400, "轻点信封", {
          fontFamily: '"Silkscreen", "Noto Sans SC", monospace',
          fontSize: "12px",
          color: "#1a1a2e",
          backgroundColor: "#ffb5c0",
          padding: { x: 6, y: 4 }
        })
        .setOrigin(0.5)
    );
    prompt.setDepth(459);

    this.floatObject(nico, 5, 1400);
    this.floatObject(envelope, 5, 1000);
    this.makeInteractive(envelope, () => {
      this.startDialogSequence(STORY.nicoLines, () => this.completeStage());
      envelope.disableInteractive();
      prompt.setText("第一片月光");
    });
  }

  private drawRabbitStage() {
    this.addGroundGlow(188, 482, 280, 42);
    const tutu = this.addAsset("rabbit-brown", 116, 438, 78, 78);
    const dudu = this.addAsset("rabbit-dark", 258, 438, 78, 78);
    tutu.setDepth(438);
    dudu.setDepth(438);
    this.floatObject(tutu, 4, 1200);
    this.floatObject(dudu, 5, 1300);

    const lanternPositions = [
      [96, 326],
      [176, 326],
      [256, 326]
    ];
    let lit = 0;
    lanternPositions.forEach(([x, y], index) => {
      const lantern = this.addAsset("carrot-lantern", x, y, 42, 58);
      const glow = this.addToStage(this.add.rectangle(x, y + 5, 58, 58, colors.moon, 0));
      glow.setBlendMode(Phaser.BlendModes.ADD);
      this.floatObject(lantern, 4 + index, 1100 + index * 80);
      this.makeInteractive(lantern, () => {
        lantern.disableInteractive();
        lit += 1;
        this.tweens.add({ targets: glow, alpha: 0.5, scale: 1.25, duration: 260 });
        if (lit === 3) {
          this.startDialogSequence([STORY.rabbitLines[index]], () => this.completeStage());
        } else {
          this.updateUi(STORY.rabbitLines[index], "继续故事", true);
        }
        this.haptic();
      });
    });
  }

  private drawGliderStage() {
    this.addMemorySign(195, 504, "小区树下的姊姊妹妹");
    const sister = this.addAsset("glider-white", 126, 360, 70, 70);
    const sister2 = this.addAsset("glider-mottle", 268, 394, 70, 70);
    sister.setDepth(360);
    sister2.setDepth(394);
    this.floatObject(sister, 10, 1650);
    this.floatObject(sister2, 12, 1800);

    let caught = 0;
    const needed = 5;
    const lineAt = new Map([
      [1, STORY.gliderLines[0]],
      [3, STORY.gliderLines[1]],
      [5, STORY.gliderLines[2]]
    ]);

    const shardPositions = [
      [92, 292],
      [184, 278],
      [298, 302],
      [128, 430],
      [312, 456]
    ];
    shardPositions.forEach(([x, y], index) => {
      const shard = this.addToStage(this.add.image(x, y, "moon-shard").setScale(1.55));
      shard.setDepth(y + 10);
      this.floatObject(shard, 6 + index, 1200 + index * 90);
      this.makeInteractive(shard, () => {
        shard.disableInteractive();
        caught += 1;
        this.tweens.add({
          targets: shard,
          alpha: 0,
          scale: 2.2,
          duration: 220,
          onComplete: () => shard.destroy()
        });
        const nextLine = lineAt.get(caught);
        if (nextLine && caught >= needed) {
          this.startDialogSequence([nextLine], () => this.completeStage());
        } else if (nextLine) {
          this.updateUi(nextLine, "继续故事", true);
        }
        this.haptic();
      });
    });
  }

  private drawCatStage() {
    this.addGroundGlow(195, 480, 292, 44);
    this.addMemorySign(195, 258, "楼下遇见小咪");
    const cowCat = this.addAsset("cat-cow", 118, 438, 76, 66);
    const tabby = this.addAsset("cat-tabby", 265, 446, 58, 52);
    cowCat.setDepth(438);
    tabby.setDepth(446);
    this.floatObject(cowCat, 4, 1260);
    this.floatObject(tabby, 4, 1180);

    const boxes = [
      [72, 318, STORY.photoSlots[0].label, STORY.catLines[0]],
      [195, 300, STORY.photoSlots[1].label, STORY.catLines[1]],
      [318, 318, STORY.photoSlots[2].label, STORY.catLines[2]]
    ] as const;
    let opened = 0;
    boxes.forEach(([x, y, label, line], index) => {
      const card = this.addPhotoCard(x, y, label);
      this.makeInteractive(card, () => {
        card.disableInteractive();
        opened += 1;
        this.addMoonBurst(x, y - 8);
        if (opened === boxes.length) {
          this.startDialogSequence([line], () => this.completeStage());
        } else {
          this.updateUi(line, "继续故事", true);
        }
        this.haptic();
      });
      if (index === 1) {
        this.tweens.add({ targets: card, y: y - 5, yoyo: true, repeat: -1, duration: 1200 });
      }
    });
  }

  private drawPlazaStage() {
    this.addGroundGlow(195, 432, 294, 52);
    this.addMemorySign(195, 318, "郑州二七广场的夜风");
    const moon = this.addToStage(this.add.rectangle(195, 210, 54, 54, colors.moon, 0.18));
    this.tweens.add({ targets: moon, alpha: 0.42, yoyo: true, repeat: -1, duration: 1400 });

    let released = 0;
    const needed = 7;
    const lineAt = new Map([
      [2, STORY.plazaLines[0]],
      [5, STORY.plazaLines[1]],
      [7, STORY.plazaLines[2]]
    ]);
    for (let i = 0; i < needed; i += 1) {
      const birdPositions = [
        [72, 390],
        [112, 366],
        [154, 398],
        [198, 366],
        [238, 398],
        [282, 366],
        [320, 390]
      ];
      const [x, y] = birdPositions[i];
      const bird = this.addToStage(
        this.add.image(x, y, "pigeon").setScale(1.15)
      );
      bird.setDepth(y);
      this.makeInteractive(bird, () => {
        bird.disableInteractive();
        released += 1;
        this.tweens.add({
          targets: bird,
          x: bird.x + Phaser.Math.Between(-80, 80),
          y: bird.y - Phaser.Math.Between(160, 230),
          alpha: 0,
          duration: 900,
          ease: "Cubic.easeOut",
          onComplete: () => bird.destroy()
        });
        const nextLine = lineAt.get(released);
        if (nextLine && released >= needed) {
          this.startDialogSequence([nextLine], () => this.completeStage());
        } else if (nextLine) {
          this.updateUi(nextLine, "继续故事", true);
        }
        if (released === needed) {
          this.tweens.add({ targets: moon, alpha: 0.95, scale: 1.58, duration: 900 });
        }
      });
    }
  }

  private addPhotoCard(x: number, y: number, label: string) {
    const card = this.addToStage(this.add.container(x, y));
    card.setDepth(y + 30);
    const g = this.add.graphics();
    g.fillStyle(colors.black, 0.82);
    g.fillRect(-41, -52, 86, 110);
    g.fillStyle(colors.night, 1);
    g.fillRect(-45, -56, 86, 110);
    g.lineStyle(3, colors.black, 1);
    g.strokeRect(-45, -56, 86, 110);
    g.fillStyle(colors.deepBlue, 1);
    g.fillRect(-34, -43, 64, 44);
    g.lineStyle(3, colors.black, 1);
    g.strokeRect(-34, -43, 64, 44);
    card.add(g);
    card.add(
      this.add
        .text(0, -15, "照片\n待补充", {
          fontFamily: '"Silkscreen", "Noto Sans SC", monospace',
          fontSize: "10px",
          color: "#e8dff5",
          align: "center"
        })
        .setOrigin(0.5)
    );
    card.add(
      this.add
        .text(0, 25, label, {
          fontFamily: '"Silkscreen", "Noto Sans SC", monospace',
          fontSize: "8px",
          color: "#b4a5d5",
          align: "center",
          wordWrap: { width: 70 }
        })
        .setOrigin(0.5)
    );
    card.setSize(86, 110);
    return card;
  }

  private addMoonBurst(x: number, y: number) {
    for (let i = 0; i < 9; i += 1) {
      const dot = this.addToStage(
        this.add.rectangle(x, y, Phaser.Math.FloatBetween(3, 6), Phaser.Math.FloatBetween(3, 6), colors.peach, 0.95)
      );
      const angle = (Math.PI * 2 * i) / 9;
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * Phaser.Math.Between(26, 58),
        y: y + Math.sin(angle) * Phaser.Math.Between(20, 48),
        alpha: 0,
        scale: 0.2,
        duration: 620,
        ease: "Cubic.easeOut",
        onComplete: () => dot.destroy()
      });
    }
  }

  private floatObject(target: Phaser.GameObjects.GameObject, distance: number, duration: number) {
    this.tweens.add({
      targets: target,
      y: `-=${distance}`,
      yoyo: true,
      repeat: -1,
      duration,
      ease: "Sine.easeInOut"
    });
  }

  private makeInteractive(
    object: HotspotTarget & { scaleX: number; scaleY: number },
    onTap: () => void
  ) {
    const baseScaleX = object.scaleX;
    const baseScaleY = object.scaleY;
    const radius = Math.max(object.displayWidth ?? 64, object.displayHeight ?? 64, 48) * 0.62;
    const hotspot = this.addObjectHotspot(object, radius, () => {
      if (!hotspot.active) return;
      hotspot.active = false;
      onTap();
    });
    object.setInteractive();
    object.on("pointerover", () => {
      this.tweens.add({ targets: object, scaleX: baseScaleX * 1.05, scaleY: baseScaleY * 1.05, duration: 120 });
    });
    object.on("pointerout", () => {
      this.tweens.add({ targets: object, scaleX: baseScaleX, scaleY: baseScaleY, duration: 120 });
    });
  }

  private addObjectHotspot(target: HotspotTarget, radius: number, onTap: () => void) {
    const hotspot: Hotspot = {
      target,
      radius,
      active: true,
      onTap
    };
    this.hotspots.push(hotspot);
    return hotspot;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    this.handleStageTap(pointer.x, pointer.y);
  }

  private handleStageTap(x: number, y: number) {
    for (let index = this.hotspots.length - 1; index >= 0; index -= 1) {
      const hotspot = this.hotspots[index];
      if (!hotspot.active || !hotspot.target.active) continue;
      const distance = Phaser.Math.Distance.Between(x, y, hotspot.target.x, hotspot.target.y);
      if (distance <= hotspot.radius) {
        hotspot.onTap();
        return;
      }
    }
  }

  private createTextures() {
    this.makeCanvasTexture("tree-pine", 28, 38, (ctx) => {
      px(ctx, 12, 27, 5, 9, "#6b4934");
      tri(ctx, 3, 30, 14, 12, 25, 30, "#214f35");
      tri(ctx, 5, 22, 14, 4, 23, 22, "#2f7245");
      tri(ctx, 8, 15, 14, 0, 20, 15, "#3f8a52");
      px(ctx, 12, 30, 5, 4, "#4d3427");
      px(ctx, 8, 22, 4, 3, "#65a95e");
      px(ctx, 16, 13, 3, 3, "#78bf6b");
    });

    this.makeCanvasTexture("tree-round", 32, 34, (ctx) => {
      px(ctx, 14, 22, 5, 10, "#6b4934");
      px(ctx, 11, 26, 11, 5, "#4d3427");
      px(ctx, 8, 9, 18, 17, "#2f7245");
      px(ctx, 5, 14, 24, 11, "#367f4c");
      px(ctx, 10, 5, 12, 8, "#42915a");
      px(ctx, 13, 12, 9, 5, "#65a95e");
      px(ctx, 5, 22, 5, 5, "#255d3d");
      px(ctx, 24, 20, 5, 5, "#255d3d");
    });

    this.makeCanvasTexture("grass-tuft", 18, 10, (ctx) => {
      px(ctx, 1, 7, 16, 2, "#4b8f46");
      px(ctx, 3, 4, 2, 5, "#3f7c3c");
      px(ctx, 7, 2, 2, 7, "#5ca457");
      px(ctx, 12, 3, 2, 6, "#3f7c3c");
      px(ctx, 15, 5, 2, 4, "#69b35f");
    });

    this.makeCanvasTexture("flower-pixels", 20, 16, (ctx) => {
      px(ctx, 2, 10, 16, 3, "#4b8f46");
      px(ctx, 6, 8, 2, 5, "#3f7c3c");
      px(ctx, 13, 7, 2, 6, "#3f7c3c");
      px(ctx, 4, 4, 4, 4, "#ffd781");
      px(ctx, 12, 2, 4, 4, "#fff0b8");
      px(ctx, 15, 7, 3, 3, "#f2a65a");
    });

    this.makeCanvasTexture("nico", 68, 56, (ctx) => {
      px(ctx, 10, 34, 15, 8, "#d95f34");
      px(ctx, 4, 31, 13, 9, "#d95f34");
      px(ctx, 2, 31, 5, 7, "#fff0c8");
      px(ctx, 22, 25, 30, 20, "#d95f34");
      px(ctx, 36, 18, 19, 17, "#dd6f3a");
      tri(ctx, 39, 18, 43, 4, 48, 18, "#d95f34");
      tri(ctx, 51, 18, 56, 5, 59, 20, "#d95f34");
      px(ctx, 40, 25, 15, 10, "#fff0c8");
      px(ctx, 54, 28, 5, 4, "#161211");
      px(ctx, 26, 43, 5, 8, "#161211");
      px(ctx, 44, 43, 5, 8, "#161211");
      px(ctx, 48, 36, 7, 5, "#fff0c8");
    });

    this.makeCanvasTexture("rabbit-brown", 54, 58, (ctx) => {
      px(ctx, 15, 24, 26, 24, "#a06b42");
      px(ctx, 22, 13, 19, 18, "#ba7e51");
      px(ctx, 23, 0, 6, 20, "#8f5a37");
      px(ctx, 34, 1, 6, 20, "#8f5a37");
      px(ctx, 26, 5, 2, 12, "#d3a47c");
      px(ctx, 35, 6, 2, 12, "#d3a47c");
      px(ctx, 37, 19, 8, 8, "#f4d9bd");
      px(ctx, 33, 20, 3, 3, "#171410");
      px(ctx, 14, 44, 7, 7, "#6a3e28");
      px(ctx, 36, 44, 7, 7, "#6a3e28");
    });

    this.makeCanvasTexture("rabbit-dark", 54, 58, (ctx) => {
      px(ctx, 14, 25, 27, 23, "#7d543c");
      px(ctx, 22, 13, 20, 18, "#936647");
      px(ctx, 23, 0, 6, 20, "#6a442f");
      px(ctx, 34, 1, 6, 20, "#6a442f");
      px(ctx, 37, 19, 8, 8, "#e3bd94");
      px(ctx, 33, 20, 3, 3, "#171410");
      px(ctx, 14, 44, 7, 7, "#4e2d22");
      px(ctx, 36, 44, 7, 7, "#4e2d22");
    });

    this.makeCanvasTexture("glider-white", 70, 54, (ctx) => {
      px(ctx, 4, 24, 22, 11, "#f8f0e4");
      px(ctx, 44, 24, 22, 11, "#f8f0e4");
      px(ctx, 22, 18, 26, 23, "#fffaf1");
      px(ctx, 28, 10, 16, 16, "#f8f0e4");
      px(ctx, 25, 14, 6, 8, "#c8a991");
      px(ctx, 41, 14, 6, 8, "#c8a991");
      px(ctx, 32, 19, 3, 3, "#171410");
      px(ctx, 40, 19, 3, 3, "#171410");
      px(ctx, 34, 23, 5, 3, "#bb7050");
      px(ctx, 31, 42, 10, 5, "#d7c8b6");
    });

    this.makeCanvasTexture("glider-mottle", 70, 54, (ctx) => {
      px(ctx, 4, 24, 22, 11, "#8f7967");
      px(ctx, 44, 24, 22, 11, "#b09272");
      px(ctx, 22, 18, 26, 23, "#9e8269");
      px(ctx, 29, 10, 16, 16, "#b49372");
      px(ctx, 24, 15, 6, 8, "#684b3b");
      px(ctx, 41, 14, 6, 8, "#684b3b");
      px(ctx, 32, 19, 3, 3, "#171410");
      px(ctx, 40, 19, 3, 3, "#171410");
      px(ctx, 27, 29, 9, 8, "#dec7a6");
      px(ctx, 42, 31, 8, 7, "#dec7a6");
      px(ctx, 32, 42, 12, 5, "#6f5849");
    });

    this.makeCanvasTexture("cat-cow", 58, 48, (ctx) => {
      px(ctx, 13, 21, 31, 17, "#f8f3e6");
      px(ctx, 21, 11, 20, 17, "#f8f3e6");
      tri(ctx, 22, 12, 27, 2, 31, 13, "#f8f3e6");
      tri(ctx, 35, 12, 40, 2, 43, 14, "#171410");
      px(ctx, 32, 11, 10, 11, "#171410");
      px(ctx, 13, 23, 12, 11, "#171410");
      px(ctx, 28, 18, 3, 3, "#171410");
      px(ctx, 37, 18, 3, 3, "#171410");
      px(ctx, 32, 22, 4, 3, "#c76270");
      px(ctx, 16, 36, 5, 7, "#171410");
      px(ctx, 38, 36, 5, 7, "#171410");
      px(ctx, 6, 24, 10, 5, "#171410");
    });

    this.makeCanvasTexture("cat-tabby", 52, 44, (ctx) => {
      px(ctx, 13, 20, 28, 15, "#a9784f");
      px(ctx, 20, 10, 19, 16, "#b8865a");
      tri(ctx, 20, 11, 25, 2, 29, 12, "#a9784f");
      tri(ctx, 35, 11, 39, 2, 42, 13, "#a9784f");
      px(ctx, 23, 15, 3, 3, "#171410");
      px(ctx, 34, 15, 3, 3, "#171410");
      px(ctx, 27, 10, 3, 11, "#6e4933");
      px(ctx, 32, 10, 3, 11, "#6e4933");
      px(ctx, 29, 20, 4, 2, "#5c3326");
      px(ctx, 15, 34, 5, 6, "#6e4933");
      px(ctx, 34, 34, 5, 6, "#6e4933");
      px(ctx, 4, 21, 12, 4, "#8b5d42");
    });

    this.makeCanvasTexture("envelope", 42, 30, (ctx) => {
      px(ctx, 4, 6, 34, 20, "#f4e4c9");
      px(ctx, 6, 8, 30, 3, "#c76238");
      line(ctx, 6, 9, 21, 20, "#c76238", 3);
      line(ctx, 36, 9, 21, 20, "#c76238", 3);
      px(ctx, 18, 15, 7, 6, "#ffd781");
    });

    this.makeCanvasTexture("carrot-lantern", 36, 58, (ctx) => {
      px(ctx, 15, 2, 5, 10, "#4f8a4b");
      px(ctx, 8, 10, 20, 34, "#cf6a32");
      px(ctx, 11, 16, 14, 3, "#ffd781");
      px(ctx, 10, 26, 16, 3, "#ffd781");
      px(ctx, 14, 43, 9, 9, "#ffd781");
    });

    this.makeCanvasTexture("moon-shard", 24, 26, (ctx) => {
      px(ctx, 10, 1, 6, 6, "#fff4c7");
      px(ctx, 6, 7, 14, 7, "#ffd781");
      px(ctx, 8, 14, 10, 8, "#ffeba9");
      px(ctx, 11, 22, 4, 3, "#c76238");
    });

    this.makeCanvasTexture("pigeon", 30, 24, (ctx) => {
      px(ctx, 8, 10, 13, 8, "#aab0bd");
      px(ctx, 18, 7, 8, 8, "#c8ced8");
      px(ctx, 23, 10, 2, 2, "#171410");
      tri(ctx, 26, 11, 30, 13, 26, 15, "#e1b565");
      px(ctx, 2, 9, 10, 4, "#d7dce5");
      px(ctx, 8, 18, 3, 5, "#7f8794");
      px(ctx, 16, 18, 3, 5, "#7f8794");
    });
  }

  private makeCanvasTexture(
    key: string,
    width: number,
    height: number,
    paint: (ctx: CanvasRenderingContext2D) => void
  ) {
    if (this.textures.exists(key)) return;
    const texture = this.textures.createCanvas(key, width, height);
    if (!texture) {
      throw new Error(`Unable to create texture: ${key}`);
    }
    const ctx = texture.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    paint(ctx);
    texture.refresh();
  }
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function tri(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function mountUi(scene: MoonForestScene) {
  ui.primaryAction.addEventListener("click", () => scene.primaryAction());
  ui.restartButton.addEventListener("click", () => {
    ui.ending.hidden = true;
    ui.intro.classList.remove("intro--hidden");
    scene.restart();
  });
}

function renderFinale() {
  ui.endingLines.innerHTML = "";
  STORY.finalLines.forEach((lineText) => {
    const lineEl = document.createElement("p");
    lineEl.textContent = lineText;
    ui.endingLines.appendChild(lineEl);
  });
  ui.ending.hidden = false;
}

const ambient = new AmbientPlayer();
ui.soundButton.addEventListener("click", async () => {
  const active = await ambient.toggle();
  ui.soundButton.textContent = active ? "静" : "♪";
  ui.soundButton.setAttribute("aria-label", active ? "关闭音乐" : "打开音乐");
});

const scene = new MoonForestScene({
  update: (state) => {
    ui.stageChip.textContent = state.chip;
    ui.dialogTitle.textContent = state.title;
    ui.dialogText.textContent = state.text;
    ui.primaryAction.textContent = state.actionLabel;
    ui.primaryAction.disabled = !state.actionEnabled;
    ui.progressText.textContent = `${state.fragments}/${TOTAL_FRAGMENTS}`;
    ui.progressFill.style.width = `${(state.fragments / TOTAL_FRAGMENTS) * 100}%`;
  },
  finish: renderFinale
});

mountUi(scene);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-root",
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
  backgroundColor: "#16213e",
  pixelArt: true,
  roundPixels: true,
  render: {
    antialias: false,
    antialiasGL: false,
    pixelArt: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene
});

document.querySelector<HTMLElement>("#game-root")!.addEventListener("pointerdown", (event) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const worldX = ((event.clientX - rect.left) / rect.width) * WORLD_WIDTH;
  const worldY = ((event.clientY - rect.top) / rect.height) * WORLD_HEIGHT;
  scene.tapAt(worldX, worldY);
});

ui.startButton.addEventListener("click", () => {
  ui.intro.classList.add("intro--hidden");
});
