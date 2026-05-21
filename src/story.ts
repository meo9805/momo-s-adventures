export type ChapterId = "nico" | "rabbits" | "gliders" | "cats" | "plaza";

export interface Chapter {
  id: ChapterId;
  chip: string;
  title: string;
  subtitle: string;
  instruction: string;
  completeText: string;
}

export const STORY = {
  title: "momo 的月亮森林",
  subtitle: "狐狸 Nico 的 520 童话委托",
  nickname: "momo",
  address: "堡堡",
  signature: "猫猫头",
  chapters: [
    {
      id: "nico",
      chip: "第一章",
      title: "Nico 的委托",
      subtitle: "北美赤狐 Nico 守着第一封信。",
      instruction: "轻点 Nico 身边的信封，接住第一片月光。",
      completeText: "Nico 把第一片月光交给了 momo。"
    },
    {
      id: "rabbits",
      chip: "第二章",
      title: "图图和嘟嘟的棕色花园",
      subtitle: "两只棕棕的兔子，把月光藏进胡萝卜灯。",
      instruction: "点亮三盏胡萝卜灯，听兔子们说完悄悄话。",
      completeText: "棕色花园亮起来了，第二片月光回到口袋里。"
    },
    {
      id: "gliders",
      chip: "第三章",
      title: "姊姊妹妹的小区星光",
      subtitle: "姊姊是白色的，妹妹是杂色的。她们从小区的树影里滑翔而来。",
      instruction: "轻点落下的月光碎片，接住姊姊妹妹带来的风。",
      completeText: "姊姊妹妹把第三片月光托到了 momo 手心。"
    },
    {
      id: "cats",
      chip: "第四章",
      title: "小咪和小小咪的楼下",
      subtitle: "奶牛猫小咪，和一个多月大的狸花小小咪，守着楼下的小盒子。",
      instruction: "轻点三个记忆盒子，把那天主动蹭蹭的相遇打开。",
      completeText: "有些相遇不是捡到，是它主动选择了你。"
    },
    {
      id: "plaza",
      chip: "终章",
      title: "郑州二七广场的月亮",
      subtitle: "一大片鸟群从广场飞起来，把最后一片月光带回天上。",
      instruction: "轻点飞过的鸟，把月亮送回 momo 的森林。",
      completeText: "月亮完整了，童话也找到回家的路。"
    }
  ] satisfies Chapter[],
  nicoLines: [
    "堡堡，今晚的月亮不见了。",
    "Nico 说：不是偷走，是想让 momo 亲手找到今晚的浪漫。",
    "第一片月光，藏在一只北美赤狐认真守着的地方。"
  ],
  rabbitLines: [
    "图图说：momo 的温柔不是软弱，是她把世界看得很认真。",
    "嘟嘟说：棕色兔子不住在童话书里，它们住在堡堡真的生活里。",
    "第三盏灯亮起时，花园悄悄记住了今天是 520。"
  ],
  gliderLines: [
    "那天去小区里接姊姊妹妹，像把两小团风带回了家。",
    "白色的姊姊先飞过月光，杂色的妹妹把影子也变得很可爱。",
    "我想陪堡堡去很多地方，也想陪你把小小的家照顾得很热闹。"
  ],
  catLines: [
    "momo 在楼下遇到小咪，小咪先走过来蹭蹭。",
    "有些相遇不是捡到，是它主动选择了你。",
    "小小咪才一个多月大，像一小块刚从童话里跑出来的狸花月亮。"
  ],
  plazaLines: [
    "郑州二七广场那天，一大片鸟从人群和风里飞起来。",
    "我记得那一刻，因为堡堡看见它们的时候，眼睛也像被月光照了一下。",
    "最后一片月光回来了。momo 的月亮森林，今天完整了。"
  ],
  photoSlots: [
    {
      label: "小区里的姊姊妹妹",
      caption: "照片待补充"
    },
    {
      label: "楼下主动蹭蹭的小咪",
      caption: "照片待补充"
    },
    {
      label: "郑州二七广场的鸟群",
      caption: "照片待补充"
    }
  ],
  finalLines: [
    "爱你，堡堡。",
    "现实会有粗糙、残酷和疼痛的时候。",
    "但我希望你心里永远有一片不会被弄脏的月亮森林。",
    "在那里，Nico 会在树影里等你，图图和嘟嘟会把灯笼点亮，姊姊妹妹会带你越过风，小咪和小小咪会蹭到你身边。",
    "而我会尽力把这片童话守好，让 momo 一直保留最纯真的心。"
  ]
};
