/* NET/TYPE LAB — 28問・16タイプのネット人格診断。ライブラリ・外部API不要。 */
(() => {
  'use strict';

  const AXES = [
    {id:'cold', title:'熱狂 / 冷笑', low:'熱狂', high:'冷笑', lowCode:'H', highCode:'C', scoreLabel:'冷笑度', explainLow:'人の熱意に共感し、まっすぐ楽しめる。', explainHigh:'物事を一歩引いて観察し、熱量を冷静に受け止める。'},
    {id:'skim', title:'全乗っかり / スカし', low:'全乗っかり', high:'スカし', lowCode:'N', highCode:'S', scoreLabel:'スカし度', explainLow:'その場のノリに参加して、盛り上げるのが得意。', explainHigh:'ノリに巻き込まれず、自分の距離感を守る。'},
    {id:'dop', title:'じっくり / ドパミン', low:'じっくり', high:'ドパミン', lowCode:'J', highCode:'D', scoreLabel:'ドパガキ度', explainLow:'好きなものをじっくり味わい、深く楽しめる。', explainHigh:'新しい刺激を見つけるのが早く、好奇心が尽きない。'},
    {id:'contrary', title:'ミーハー / 逆張り', low:'ミーハー', high:'逆張り', lowCode:'T', highCode:'R', scoreLabel:'逆張り度', explainLow:'みんなが楽しんでいる流行を素直に楽しめる。', explainHigh:'王道に流されず、自分だけの好みを探しがち。'}
  ];
  const BONUSES = [
    {id:'approval', label:'承認欲求'}, {id:'posting', label:'SNS発信度'},
    {id:'otaku', label:'オタク濃度'}, {id:'watch', label:'炎上ウォッチ度'}
  ];

  // 「positive」: 右の選択肢ほどそのスコアが上がる。左が高い場合は false。
  const BANK = [
    {axis:'cold',q:'友達が熱い夢や目標を語り始めた。',left:'自分もワクワクして応援する',right:'まず現実的に考えてしまう',positive:true},
    {axis:'skim',q:'友達同士で急に謎の大喜利が始まった。',left:'自分もノリノリで参戦する',right:'静かに見守っている',positive:true},
    {axis:'dop',q:'短い動画が次々に流れてくる。',left:'気づけばずっと見ている',right:'適当なところで切り上げる',positive:false},
    {axis:'contrary',q:'好きだった作品が突然大バズりした。',left:'仲間が増えて嬉しい',right:'少し距離を置きたくなる',positive:true},
    {axis:'approval',q:'SNSに投稿したら、いいねが予想より少なかった。',left:'特に気にならない',right:'少し気になって見返す',positive:true},
    {axis:'posting',q:'最高に面白いものを見つけた。',left:'まずは自分で楽しむ',right:'すぐ誰かに共有したい',positive:true},
    {axis:'cold',q:'誰かが全力で応援している姿を見た。',left:'その熱量に感化される',right:'ちょっと大げさだと思う',positive:true},
    {axis:'skim',q:'友達から突然しょうもないボケを振られた。',left:'全力で拾って返す',right:'あえて流してしまう',positive:true},
    {axis:'dop',q:'気になる動画が1時間の長編だった。',left:'倍速か要点だけで見たい',right:'最初からじっくり見る',positive:false},
    {axis:'contrary',q:'みんなが絶賛している作品を見つけた。',left:'素直に気になってしまう',right:'本当に面白いか疑ってしまう',positive:true},
    {axis:'otaku',q:'作品や趣味にハマり始めた。',left:'気になるところだけ楽しむ',right:'裏設定や歴史まで調べる',positive:true},
    {axis:'watch',q:'SNSで大きな言い争いを見つけた。',left:'疲れるので閉じる',right:'つい経緯を追ってしまう',positive:true},
    {axis:'cold',q:'仲のいい人が新しい挑戦を始めた。',left:'まずはすごい！と言いたい',right:'成功するまでは様子を見る',positive:true},
    {axis:'skim',q:'グループチャットが謎テンションになっている。',left:'スタンプやコメントで乗る',right:'既読だけつけて見守る',positive:true},
    {axis:'dop',q:'ゲームでイベントが同時に3つ始まった。',left:'全部ちょっとずつ触りたい',right:'ひとつを最後まで楽しみたい',positive:false},
    {axis:'contrary',q:'ランキング1位のアイテムが気になった。',left:'王道から試してみる',right:'あえて別のものを探す',positive:true},
    {axis:'approval',q:'一番テンションが上がる褒められ方は？',left:'自分だけで成長を実感できる',right:'人からすごいと認められる',positive:true},
    {axis:'posting',q:'イベントに行って写真をたくさん撮った。',left:'思い出として自分で残す',right:'SNSにも載せて共有する',positive:true},
    {axis:'cold',q:'熱いポエムのような投稿が流れてきた。',left:'言いたいことはわかる',right:'少し気恥ずかしくなる',positive:true},
    {axis:'skim',q:'集合写真で「変顔しよう！」と言われた。',left:'真っ先に全力の変顔をする',right:'普通の顔で写りたい',positive:true},
    {axis:'dop',q:'暇な5分間が突然できた。',left:'何か新しい刺激を探す',right:'ぼーっとするのも好き',positive:false},
    {axis:'contrary',q:'大好きな曲が急にSNSの定番になった。',left:'みんなに聴かれて嬉しい',right:'ちょっと複雑な気分になる',positive:true},
    {axis:'otaku',q:'好きなものについて「おすすめ教えて」と聞かれた。',left:'短くおすすめを伝える',right:'背景までつい長く語る',positive:true},
    {axis:'watch',q:'知らない人同士のレスバが流れてきた。',left:'ほとんど興味がない',right:'結末まで追ってしまう',positive:true},
    {axis:'cold',q:'みんなが感動している動画を見た。',left:'自分も素直にグッとくる',right:'演出が気になってしまう',positive:true},
    {axis:'skim',q:'目の前で友達が盛大にスベった。',left:'さらに乗っかって笑いにする',right:'そっと話題を変える',positive:true},
    {axis:'dop',q:'SNSで新しい話題が次々に出てきた。',left:'全部チェックしておきたい',right:'好きな話題だけ深掘りする',positive:false},
    {axis:'contrary',q:'友達の間でみんな同じ作品にハマりだした。',left:'自分も一緒に楽しみたい',right:'自分なら別の作品を推したい',positive:true}
  ];

  const TYPES = {
    HNDT:{name:'全肯定ドパ怪獣',emoji:'🦖',tagline:'楽しいなら全部乗る。流行はとりあえず食べる。',desc:'流行にもノリにも秒速で乗れる、タイムラインの起爆剤。楽しいものを見つける速度が異常に速い。',good:'周囲を巻き込む熱量と、とりあえず楽しんでみる行動力。',bad:'勢いで予定を増やしすぎて、気づけば充電が0%。',traits:['元気の永久機関','初動最速','秒で沼る']},
    HNDR:{name:'逆張りパリピ',emoji:'🪩',tagline:'みんなと違う推しで、一人だけフェス開幕。',desc:'流行に乗るより、まだ知られていない面白さを発掘して叫ぶタイプ。反骨心すらエンタメに変える。',good:'未発掘の魅力を見つけ、独自の熱量で人を動かせる。',bad:'人気が出た途端、次の推しに移りたくなる。',traits:['布教に全力','隠れた名作好き','反骨ポジティブ']},
    HNJT:{name:'王道沼落ちオタク',emoji:'💖',tagline:'流行に乗ったら、気づけば一生その沼。',desc:'話題作を気軽に試し、気に入ったら深く長く愛するタイプ。盛り上がりにも温かく参加する。',good:'楽しいものを分かち合い、コミュニティを心地よくする。',bad:'周りに合わせすぎて、自分のペースを見失うことも。',traits:['推しに一途','共感力高め','おすすめ上手']},
    HNJR:{name:'古参布教モンスター',emoji:'📣',tagline:'これがバズる前から、全員にすすめてました。',desc:'マイナーな沼に深く潜り、魅力を熱く語る。布教したいのに有名になりすぎるとちょっと寂しい。',good:'深い知識と愛情で、知らなかった世界の扉を開ける。',bad:'古参であることを少しだけ誇りに思いすぎる。',traits:['好きが深い','長文おすすめ','古参の誇り']},
    HSDT:{name:'無表情ドパガキ',emoji:'📱',tagline:'顔は真顔、親指だけが爆速で動く。',desc:'普段は落ち着いて見えるのに、スマホの中では流行を爆速巡回。熱狂を表に出さないステルス型。',good:'情報への反応が速く、場に合わせて静かに楽しめる。',bad:'面白いと思っていることが人に伝わらない。',traits:['無言でバズ回収','内心大興奮','二面性あり']},
    HSDR:{name:'ツンデレ逆張り猫',emoji:'🐈',tagline:'別に好きじゃないし。保存しただけだし。',desc:'独自の流行センサーが鋭いのに、テンションの高さは隠しがち。好きなものほど素直になれない。',good:'人の目に流されない選球眼と、密かな情熱。',bad:'「興味ない」が口癖になって、本心を見失う。',traits:['素直じゃない','秘密の推し','発掘担当']},
    HSJT:{name:'こっそりミーハー猫',emoji:'🐱',tagline:'流行は全部チェック。反応はだいたい「へえ」。',desc:'人気のコンテンツをきちんと楽しむけれど、騒ぐよりじっくり味わいたい。控えめな流行好き。',good:'周りに流されすぎず、トレンドを穏やかに楽しめる。',bad:'実は好きなのに、興味がないと思われやすい。',traits:['静かなファン','じっくり消費','控えめ共感']},
    HSJR:{name:'ひとり沼仙人',emoji:'🧙',tagline:'みんなが知らない沼で、今日も一人で修行中。',desc:'人知れず深い沼に住む、静かな愛好家。騒がず、迎合せず、好きなものを自分のペースで守る。',good:'流行に揺らがない審美眼と、長く続く熱意。',bad:'好きなものを共有する機会まで逃しがち。',traits:['深い知識','隠れ名作好き','マイペース']},
    CNDT:{name:'炎上ポップコーンマン',emoji:'🍿',tagline:'騒ぎを見つけたら、まず観戦席を確保。',desc:'一歩引いた目線を保ちつつ、ネットの騒ぎには積極的に参加。ツッコミと反応の速さが武器。',good:'場の空気を読み、面白い切り口で会話を盛り上げる。',bad:'冗談が過ぎると、誰かを傷つけることがある。',traits:['ポップコーン常備','反応最速','ツッコミ上手']},
    CNDR:{name:'逆張りレスバ怪獣',emoji:'😈',tagline:'多数派を見ると、反論したくてうずうず。',desc:'世間のノリをそのまま受け取らず、あえて別の視点をぶつけに行く。議論も一種のエンタメ。',good:'多数派が見落とす矛盾を発見し、議論に刺激を与える。',bad:'言い方次第では、正しい指摘まで嫌われてしまう。',traits:['反論の天才','議論好き','逆から見る']},
    CNJT:{name:'正論ツッコミ番長',emoji:'🚨',tagline:'楽しんではいる。でもツッコミだけは止まらない。',desc:'人気コンテンツを楽しみながらも、矛盾やツッコミどころは見逃さない。冷静な観察者なのに会話は好き。',good:'愛のあるツッコミで、場に新しい視点を加えられる。',bad:'褒め言葉より先にツッコミが出てしまう。',traits:['観察眼が鋭い','皮肉が得意','楽しさも理解']},
    CNJR:{name:'頼まれてない評論家',emoji:'🧐',tagline:'呼ばれてないけど、ここから長文で解説します。',desc:'流行より自分の考えを優先し、じっくり考えてから口を開く。真剣な議論さえどこか俯瞰している。',good:'前提を疑う力と、筋道の通った説明。',bad:'会話の温度を下げるほど、正論を磨きがち。',traits:['前提を疑う','論点整理','じっくり反論']},
    CSDT:{name:'炎上ROM専妖怪',emoji:'👻',tagline:'発言ゼロ。炎上の経緯だけは完全把握。',desc:'表には出ないけれど最新の騒動には詳しい。何にも乗らず、誰より早くタイムラインを巡回する。',good:'冷静に情報の流れを把握し、余計な争いに巻き込まれない。',bad:'情報を追いすぎて、疲れに気づきにくい。',traits:['ROM専巡回員','最新騒動把握','無言で観測']},
    CSDR:{name:'冷笑ドパガキ',emoji:'🕶️',tagline:'くだらない（スクロール3時間目）。',desc:'刺激は大好き。でもそれを認めるのはちょっと悔しい。冷めた顔でネットの深みに潜っていく矛盾の人。',good:'話題へのアンテナが鋭く、熱狂に飲まれず面白さを見抜く。',bad:'何でも茶化してしまい、本当に好きなものまで隠しがち。',traits:['ツッコミ脳','秘密の中毒','冷めたフリ']},
    CSJT:{name:'流行監視ロボット',emoji:'🤖',tagline:'流行への参加はゼロ。情報収集だけ皆勤賞。',desc:'バズっているものを冷静に見つめる、タイムラインの気象予報士。熱狂よりも人々の反応そのものが面白い。',good:'俯瞰した観察力で、流行の本質や変化に気づける。',bad:'一歩引きすぎて、参加するタイミングを逃す。',traits:['俯瞰力高め','観測専門','事情通']},
    CSJR:{name:'既読スルー仙人',emoji:'🧘',tagline:'通知は見た。返事は来世にする。',desc:'騒がず、媚びず、むやみに動じない。自分の価値観を持つ一方、ネットの何に対しても距離を取りがち。',good:'流行に左右されず、独立した判断を続けられる。',bad:'余裕を演じすぎると、人から遠く見える。',traits:['マイペースの極み','静かな審判','ブレない自分']}
  };

  // タイプ別の読み物。4軸の判定ロジックとは独立して管理する。
  const TYPE_STORIES = {
  "HNDT": {
    "personality": "楽しそうなものを見つけると、考えるより先に体が動く。流行には素直に乗るし、誰かが盛り上がっていれば「それ何？ 自分もやる！」と飛び込んでいく。ネットでもリアルでも、あなたがいるだけで場の温度が少し上がるタイプ。",
    "habits": "気になる動画を保存した直後に別の動画を見始め、推しの候補だけが増えていく。グループチャットではリアクションが早く、面白そうなイベントを見つけるととりあえず全員を誘う。",
    "scene": "友達が「これ最近流行ってるよ」と言った瞬間、もう検索している。気づけば別の流行も見つけて、話題が三回脱線。本人は全部楽しいので、なぜ周りが追いつけないのか不思議に思っている。",
    "others": "「誘うと絶対楽しんでくれる人」。その明るさは強みだけど、毎回全力で乗るせいで予定もタブも増えがち。たまには一つを最後まで味わうと、好きがもっと深くなる。"
  },
  "HNDR": {
    "personality": "盛り上がるのは大好き。でも、みんなと同じものに熱狂するだけでは物足りない。まだ誰も知らないネタや作品に飛びつき、その面白さを誰より大きな声で語りたくなる、反骨心つきのムードメーカー。",
    "habits": "ランキングの上位より、コメント欄で一人だけ推されている作品が気になる。「それよりこっちのほうが面白い」が口癖なのに、紹介するときのテンションは誰より高い。",
    "scene": "みんなが話題作の感想で盛り上がる中、「いや、この無名作品を見て」と急にプレゼンが始まる。最初は全員ぽかんとしているのに、気づけば一人二人と布教に成功している。",
    "others": "「何でも面白くしてくれるけど、好みが読めない人」。発掘力は魅力。ただ、マイナーであること自体を好きになりすぎると、せっかくの推しが有名になった瞬間に複雑な顔をしがち。"
  },
  "HNJT": {
    "personality": "流行っているものを素直に楽しめるうえに、好きになったらとことん深い。一時的なブームとして消費するより、作品の登場人物や背景まで知りたくなる。友達と一緒に盛り上がりながら、いつの間にか本気のファンになっている人。",
    "habits": "「軽く見てみるだけ」のはずが、関連動画や過去作まで一気にチェックする。お気に入りのシーンは繰り返し見返し、誰かが同じ作品を好きだと知ると話が急に長くなる。",
    "scene": "みんなで見始めたドラマが終わる頃、周囲は次の話題へ。あなただけは登場人物の考察を読み、主題歌を聴き、次のイベント情報まで追っている。",
    "others": "「一緒に好きになってくれる安心感のある人」。共感力があるからこそ、周りの熱量に合わせて疲れることも。自分が好きなペースを守って大丈夫。"
  },
  "HNJR": {
    "personality": "好きなものに対する愛情が深く、しかもその良さを人に伝えずにはいられない。王道より少し外れた作品や文化を長く追いかけ、知らない人に魅力を届ける瞬間に喜びを感じる、情熱的な布教担当。",
    "habits": "おすすめを聞かれると三行で終わる予定が長文になる。「まずこの初期作品から」と履修順まで考え始める。推しの知名度が上がると嬉しい反面、少しだけ寂しくなる。",
    "scene": "友達が偶然あなたの推しを褒めた瞬間、昔のライブ映像やインタビューまで資料が飛んでくる。数分の雑談が一時間の入門講座になりがち。",
    "others": "「好きなものを語らせると最強の人」。熱量は魅力だけれど、初心者に最初から全情報を渡すと圧倒してしまうことも。入口は短く、続きは求められてからがちょうどいい。"
  },
  "HSDT": {
    "personality": "周囲からは落ち着いて見られるのに、スマホの中では好奇心が大暴れ。新しい流行や面白いネタを見逃したくないけれど、その熱狂を表情や言葉にはあまり出さない。静かな顔の裏に、高速で更新されるタイムラインを飼っている。",
    "habits": "人前では「ふーん」で済ませた動画を、帰宅後に何本も見ている。通知はすぐ開くのに返信は短文。面白い投稿の保存数と、実際に人へ見せた数がまったく一致しない。",
    "scene": "友達が「最近これ流行ってるらしい」と教えてくれたとき、内心では関連ネタまで全部知っている。ところが返事は「そうなんだ」の一言だけで、知識量がまったくバレない。",
    "others": "「大人しいのに、なぜか最新ネタを知っている人」。一人で楽しむのは得意だけど、反応が薄いと興味がないと誤解されることも。たまには面白かったと言葉にしてみて。"
  },
  "HSDR": {
    "personality": "自分だけが見つけた面白さに強く惹かれるのに、その興奮を素直に出すのは少し照れくさい。人が騒いでいる場では一歩引いていても、心の中ではマイナーな話題に大盛り上がりしている天邪鬼タイプ。",
    "habits": "「別にハマってない」と言いながら関連動画を保存。人におすすめを聞かれても最初は濁すのに、相手が本当に興味を持ったとわかると急に饒舌になる。",
    "scene": "ひそかに追っていた作品がバズると、表では「今さら？」と強がる。でもタイムラインに感想が増えたことは嬉しくて、結局また検索してしまう。",
    "others": "「好き嫌いがはっきりしていて、意外と情が深い人」。独自の感性は武器。好きなものを隠しすぎると、同じ趣味の仲間と出会うチャンスまで逃すかも。"
  },
  "HSJT": {
    "personality": "人気のものはちゃんと気になるし、良さも素直に認める。ただ、大騒ぎして参加するより、ひとりでじっくり楽しむほうが落ち着く。流行から遠ざかるわけでも、流行に振り回されるわけでもない、静かなミーハー。",
    "habits": "話題の作品はひっそり全話視聴。SNSに感想を書かなくても、好きな場面は何度も見返す。みんなが「今これ来てる」と盛り上がる頃には、すでに詳しくなっている。",
    "scene": "友達同士で流行のドラマの話になり、「見てる？」と聞かれて静かにうなずく。ところが細かい質問をすると、伏線まで把握していることが判明する。",
    "others": "「控えめだけど一緒に話すと詳しい人」。自分のペースで楽しめるのが長所。反応を抑えすぎず、好きな場面だけでも話すと周りはきっと嬉しい。"
  },
  "HSJR": {
    "personality": "誰かに理解されなくても、自分の好きな世界を深く掘り続けられる。新しい刺激を追い回すより、長く愛せる作品や趣味を大切にする。流行にも周囲のテンションにも左右されにくい、静かな専門家タイプ。",
    "habits": "何年も前の記事や作品に突然たどり着き、夜が終わるまで調べてしまう。おすすめを聞かれない限り語らないのに、聞かれた瞬間だけ情報量が急増する。",
    "scene": "流行の話題でタイムラインが埋まっている頃、あなたは昔から好きな作品の設定資料を読んでいる。友達が偶然その趣味に触れたら、普段とは別人のように説明し始める。",
    "others": "「自分の世界を持っている人」。好きなものを長く続けられるのは立派な才能。独りで完結しすぎず、たまには仲間に入口を開いてあげてもいい。"
  },
  "CNDT": {
    "personality": "ネットの騒ぎを一歩引いて眺めながらも、面白い展開にはすぐ反応する。誰かの熱い主張をそのまま信じるより、「ここツッコミどころじゃない？」と笑いに変えがちな、お祭り好きの観戦者。",
    "habits": "急に話題になった出来事を知ると、元の投稿と反応をざっと確認。グループチャットには「今これ見た？」とスクショを送り、状況をひと言でまとめて盛り上げる。",
    "scene": "SNSが大騒ぎしている夜、友達はあなたから送られてくる実況で流れを知る。ただし騒動の登場人物までネタにすると、笑えない人もいることに注意。",
    "others": "「ネットのニュースを面白く話してくれる人」。反応の速さとユーモアは魅力。見物と加勢は別物なので、誰かを傷つけるノリには一線を引くとさらに頼もしい。"
  },
  "CNDR": {
    "personality": "みんなが「そうだよね」と言い始めると、つい別の可能性を考えてしまう。しかも頭の中だけで終わらず、会話やコメントで反論してみたくなる。刺激的な議論と意外な視点が好きな、逆方向から走ってくる論客。",
    "habits": "見出しを読んだ瞬間に「いや、それは違くない？」が浮かぶ。コメント欄を開いて議論の穴を探し、返事が来るとさらに頭が回転する。気づけば寝る時間を過ぎている。",
    "scene": "友達全員が話題の作品を褒めているとき、「でもここ微妙じゃない？」と切り込む。議論は白熱するけれど、相手はただ好きな気持ちを共有したかっただけかもしれない。",
    "others": "「話すと視野が広がるけど、たまに疲れる人」。反対意見を出す力は貴重。相手が議論を求めている場面かどうかを見極めると、強みがもっと生きる。"
  },
  "CNJT": {
    "personality": "話題作を楽しむ気持ちはあるのに、細かい違和感を見逃せない。場のノリにも加わる一方で、表現の矛盾や設定の穴にはきっちりツッコミを入れたい。愛のある批評と笑いを行き来する、観察眼の鋭いタイプ。",
    "habits": "映画を見たあと、真っ先に「あのシーンさ」と気になった点を話す。でも嫌いだったわけではなく、好きだからこそ細部まで気になる。感想がいつの間にか考察会になる。",
    "scene": "友達と人気ドラマの最終話を見たあと、全員が感動しているところで伏線の回収漏れを発見。笑いが起こる日もあれば、少し空気が止まる日もある。",
    "others": "「一緒に見ると解説が面白い人」。細部に気づけるのは才能。まずは「ここ良かったよね」を一言添えると、ツッコミもずっと受け取られやすくなる。"
  },
  "CNJR": {
    "personality": "流行や多数派の意見を、そのまま正解として受け取らない。時間をかけて考え、自分なりの根拠がそろってから言葉にする。面白い話題ほど構造を分析したくなる、知識と皮肉を併せ持つ評論家気質。",
    "habits": "短い感想を求められても、前提条件の説明から入ってしまう。話題作を見たあとはレビューを読み比べ、表面的な評価より「なぜそう感じたか」を考える。",
    "scene": "友達の「これって良いよね？」に答えるつもりが、気づけば歴史的背景から解説している。本人は丁寧に答えたつもりでも、相手は相づちだけで済ませたかった可能性がある。",
    "others": "「詳しく聞くと頼りになるけど、雑談も討論会にする人」。考える深さは魅力。ときには結論を急がず、ただ一緒に楽しむ時間があってもいい。"
  },
  "CSDT": {
    "personality": "ネット上の騒ぎには反応しない。でも何が起きたかは誰より把握していたい。新着の話題を素早く追い、各方面の反応を静かに見比べる。表舞台には出ないのに、情報だけはいつも最前列にいる観測者。",
    "habits": "何も書き込まずに関連ポストを何十件も読む。通知が荒れていても既読だけ付け、気づいたら騒動の時系列を説明できるほど詳しくなっている。",
    "scene": "友達が翌日「昨日の炎上知ってる？」と聞いてくる。あなたは最初の投稿から謝罪まで全部知っているが、返答は「うん、見た」の二文字で終わる。",
    "others": "「何も言わないのに情報通な人」。余計な争いに巻き込まれにくいのは長所。ただ、観察に時間を使いすぎると自分まで疲れるので、閉じる勇気も忘れずに。"
  },
  "CSDR": {
    "personality": "ネットの流行を「くだらない」と切り捨てたくなる一方、刺激的な話題には吸い寄せられる。人が騒ぐ姿を冷静に観察しているつもりで、実はその騒ぎを一番熱心に追っている。冷めた顔と止まらないスクロールが同居するタイプ。",
    "habits": "「こんなの誰が見るんだよ」と言いながら最後まで見る。誰にもおすすめしない投稿を大量保存し、謎の界隈にだけ妙に詳しい。興味がないふりをするほど、深夜の閲覧履歴が雄弁になる。",
    "scene": "友達がバズった動画の話をすると「もう飽きた」と返す。でも次に流行りそうな派生ネタも全部知っていて、気づけばあなたが一番長く話している。",
    "others": "「何でも斜めから見ているのに、結局ネットが大好きな人」。観察力は強み。好きなものまで冷笑で隠さず、たまには素直に笑うと意外な仲間が増える。"
  },
  "CSJT": {
    "personality": "流行はきちんと把握するけれど、その輪に飛び込む必要は感じない。ブームそのものより「どうして人はこれに惹かれるのか」に興味が向く。落ち着いた目線でネットを見守る、静かな分析ロボット。",
    "habits": "話題の作品を一度は確認し、コメントの傾向まで眺める。感想を投稿するより頭の中で整理するほうが得意で、バズが終わる頃に原因を説明できる。",
    "scene": "友達が「これ流行ってるよね！」と話しかけると、「今はこういう構造で広まってるらしい」と返してしまう。相手が欲しかったのは分析ではなく「面白いよね」だったかもしれない。",
    "others": "「冷静で、流行に振り回されない人」。観察を言語化するのが上手。ただ、分析の外側にも楽しさはあるので、時には理由抜きで参加してみてもいい。"
  },
  "CSJR": {
    "personality": "どんな話題でも一度距離を取り、自分の基準で価値を決める。流行にもネット上の熱狂にも簡単には動じず、興味のあることだけをじっくり考える。通知の多い時代に、ひとりだけ山奥の静けさを持ち込んだような存在。",
    "habits": "盛り上がっているグループチャットを後で読むつもりで閉じ、そのまま忘れる。流行の説明を求められても「そうなんだ」で終わり、好きなものは誰にも急かされず楽しむ。",
    "scene": "SNSが大炎上して全員が意見を言い合っているとき、あなたは別の本や動画をじっくり見ている。数日後に話題を振られても「まだやってたの？」と本気で驚く。",
    "others": "「ブレなくて安心するけれど、少し近寄りがたい人」。距離を取れる強さは魅力。大切な人への返事だけは、仙人モードを解除して早めに返してあげよう。"
  }
};

  const app = document.getElementById('app');
  const toast = document.getElementById('toast');
  const STORAGE = 'nettype_v1';
  const ANSWER_STORAGE = 'nettype_answers_v1';
  const scoreIds = [...AXES.map(a=>a.id), ...BONUSES.map(b=>b.id)];
  const state = {current:0,answers:Array(BANK.length).fill(null),currentResult:null,inviter:null,inviterToken:null};
  let toastTimer;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove('visible'),3300);
  }
  function scrollTop(){ window.scrollTo({top:0,behavior:'instant'}); }
  function storageGet(key){try{return localStorage.getItem(key);}catch{return null;}}
  function storageSet(key,val){try{localStorage.setItem(key,val);}catch{}}
  function storageRemove(key){try{localStorage.removeItem(key);}catch{}}
  function paramsClean(){return location.pathname + location.hash;}
  function setUrlSearch(search){try{history.replaceState(null,'',location.pathname+(search?'?'+search:'')+location.hash)}catch{}}
  function typeCode(scores){return AXES.map(a=>scores[a.id]>=50?a.highCode:a.lowCode).join('');}
  function clamp(x,min,max){return Math.min(max,Math.max(min,x));}
  function getType(result){return TYPES[typeCode(result.scores)];}
  function validateScores(obj){
    if(!obj || typeof obj!=='object') return null;
    const scores={};
    for(const id of scoreIds){if(typeof obj[id]!=='number'||!Number.isFinite(obj[id])||obj[id]<0||obj[id]>100)return null; scores[id]=Math.round(obj[id]);}
    return {scores,code:typeCode(scores)};
  }
  function encodeResult(result){
    const values = scoreIds.map(id=>result.scores[id]);
    return btoa(JSON.stringify({v:1,s:values})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function decodeResult(token){
    try{
      if(!token||token.length>600||!/^[a-zA-Z0-9_-]+$/.test(token))return null;
      const bytes=atob(token.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4-token.length%4)%4));
      const obj=JSON.parse(bytes);
      if(obj.v!==1||!Array.isArray(obj.s)||obj.s.length!==scoreIds.length)return null;
      return validateScores(Object.fromEntries(scoreIds.map((id,i)=>[id,obj.s[i]])));
    }catch{return null;}
  }
  function resultLink(result){return location.href.split(/[?#]/)[0]+'?r='+encodeResult(result);}
  function friendLink(result){return location.href.split(/[?#]/)[0]+'?with='+encodeResult(result);}
  function calculateResult(){
    const buckets=Object.fromEntries(scoreIds.map(id=>[id,[]]));
    BANK.forEach((item,i)=>{
      const answer=state.answers[i];
      if(answer===null)return;
      const centered=(answer-2)/2; // -1 ~ 1
      buckets[item.axis].push(centered*(item.positive?1:-1));
    });
    const scores={};
    for(const id of scoreIds){
      const vals=buckets[id];
      if(!vals.length)throw Error('Missing score for '+id);
      scores[id]=clamp(Math.round(50+50*vals.reduce((a,b)=>a+b,0)/vals.length),0,100);
    }
    return {scores,code:typeCode(scores)};
  }
  function getProgress(){
    try {
      const p=JSON.parse(storageGet(ANSWER_STORAGE));
      if(!p || !Array.isArray(p.answers) || p.answers.length!==BANK.length || !Number.isInteger(p.current) || p.current<0 || p.current>=BANK.length)return null;
      if(!p.answers.every(v=>v===null || (Number.isInteger(v)&&v>=0&&v<=4)))return null;
      if(!p.answers.some(v=>v!==null))return null;
      return p;
    } catch {return null;}
  }
  function renderHome(){
    state.currentResult=null;
    const inviterType=state.inviter?getType(state.inviter):null;
    const previous=decodeResult(storageGet(STORAGE));
    const progress=getProgress();
    app.innerHTML=`
      <section class="hero">
        <div>
          <div class="eyebrow">WELCOME TO YOUR INTERNET IDENTITY</div>
          <h1>その性格、<br><span class="highlight">ネットで言うと</span><br>何者ですか。</h1>
          <p class="hero-lede">冷笑、スカし、ドパガキ、逆張り。<br>ネットで言われがちな「あのタイプ」。あなたに一番近いのは？ 28問で、隠れたネット人格を暴きます。</p>
          ${inviterType?`<div class="pill" style="display:inline-flex;margin-top:19px;border-color:#89a968;color:var(--lime)">💌 ${inviterType.emoji} ${inviterType.name} から相性チャレンジ！</div>`:''}
          <div class="hero-cta"><button class="btn btn-primary" data-action="${progress&&!inviterType?'resume':'start'}">${inviterType?'診断して相性を見る':progress?'前回の続きから':'無料で診断スタート'} <span aria-hidden="true">↗</span></button>${progress&&!inviterType?'<button class="btn btn-outline" data-action="start">最初から</button>':previous?'<button class="btn btn-outline" data-action="previous">前回の結果を見る</button>':'<button class="btn btn-outline" data-action="sample">結果をのぞく</button>'}</div>
          <div class="hero-fine">✦ 登録不要　✦ 完全無料　✦ 3〜5分　✦ 結果はシェアOK</div>
        </div>
        <div class="hero-art" aria-hidden="true"><div class="art-ring"></div><div class="art-orbit">16 PERSONALITIES ✳</div>
          <div class="sample-card"><div class="sample-top"><span>NET/TYPE ID.</span><span>✳ 16 / 16</span></div><div class="sample-emoji">🕶️</div><div class="sample-id">CSDR / 014</div><h3>冷笑ドパガキ</h3><p>くだらない（スクロール3時間目）。</p><div class="sample-bottom"><span class="tag">冷笑 92%</span><span class="tag">ドパ 94%</span><span class="tag">逆張り 85%</span></div></div>
          <div class="art-mini"># 自分これで草</div>
        </div>
      </section>
      <div class="info-strip"><div class="info-stat"><strong>16</strong><span>ネット人格タイプ</span></div><div class="info-stat"><strong>28</strong><span>直感で答える質問</span></div><div class="info-stat"><strong>08</strong><span>ネット属性パラメータ</span></div></div>
      <section class="section" id="concept"><div class="section-head"><div><div class="eyebrow">HOW IT WORKS</div><h2>ちょっと嫌で、<br>ちょっと当たってる。</h2></div><p class="section-sub">人に見せたくなる、<br>インターネット生まれの自己紹介。</p></div><div class="features"><div class="feature"><span class="feature-num">01 — ANSWER</span><h3>直感で28問に回答</h3><p>ありがちな自己評価ではなく、ネットでの行動や反応から判定。</p></div><div class="feature"><span class="feature-num">02 — REVEAL</span><h3>16タイプから判定</h3><p>キャラクターと8つのネット属性で、あなたの「ネット人格」を可視化。</p></div><div class="feature"><span class="feature-num">03 — COMPARE</span><h3>友達と見せ合う</h3><p>結果画像を保存してシェア。専用リンクで友達との相性も比べられる。</p></div></div></section>
      <section class="section" id="types"><div class="section-head"><div><div class="eyebrow">16 INTERNET ARCHETYPES</div><h2>ネットの住人、<br>全16タイプ。</h2></div><p class="section-sub">有名な言葉も、<br>この診断だけの名前も。</p></div><div class="pills"><span class="pill"># 冷笑系</span><span class="pill"># スカし</span><span class="pill"># ドパガキ</span><span class="pill"># 逆張り</span><span class="pill"># 古参</span><span class="pill"># ミーハー</span><span class="pill"># オタク</span></div><div class="types-preview">${Object.entries(TYPES).map(([code,t])=>`<button type="button" class="type-tile type-tile-button" data-action="type-detail" data-code="${code}" aria-label="${t.name}の詳しい説明を見る"><span class="tile-emoji">${t.emoji}</span><strong>${t.name}</strong><small>${code}</small><span class="tile-read">人物像を読む ↗</span></button>`).join('')}</div><div style="text-align:center;margin-top:26px"><button class="btn btn-primary" data-action="start">自分のタイプを調べる ↗</button></div><p class="disclaimer" style="margin-top:20px">※本サービスはインターネット文化を題材にした娯楽コンテンツです。MBTI等の公式検査ではなく、科学的な性格診断・医学的な判定を目的とするものではありません。</p></section>`;
    scrollTop();
  }
  function startQuiz(){state.answers=Array(BANK.length).fill(null);state.current=0;storageRemove(ANSWER_STORAGE);setUrlSearch(state.inviterToken?'with='+state.inviterToken:'');renderQuiz();}
  function renderQuiz(){
    const idx=state.current, q=BANK[idx], selected=state.answers[idx];
    app.innerHTML=`<div class="question-wrap"><div class="question-top"><span>NET/TYPE — ASSESSMENT</span><span class="question-num">${String(idx+1).padStart(2,'0')} / ${BANK.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${(idx+1)/BANK.length*100}%"></div></div><div class="question-panel"><div class="question-prompt">QUESTION ${String(idx+1).padStart(2,'0')} · あなたならどうする？</div><h2>${q.q}</h2><div class="choice-ends"><div class="choice-end first">A. ${q.left}</div><div class="choice-end last">B. ${q.right}</div></div><div class="choices" role="group" aria-label="回答を5段階で選択">${[0,1,2,3,4].map(v=>`<button class="choice" aria-pressed="${selected===v}" data-choice="${v}" aria-label="${['とてもA寄り','少しA寄り','どちらとも言えない','少しB寄り','とてもB寄り'][v]}">${v+1}</button>`).join('')}</div><div class="choice-caption"><span>← とてもA寄り</span><span>どちらでもない</span><span>とてもB寄り →</span></div><div class="question-actions"><button class="btn btn-outline" data-action="back" ${idx===0?'disabled':''}>← 戻る</button><button class="btn btn-primary" data-action="next" ${selected===null?'disabled':''}>${idx===BANK.length-1?'結果を見る ↗':'次の質問へ →'}</button></div></div><p class="question-help">考えすぎず、普段の自分に近い方を選んでください。1〜5の数字キーでも回答できます。</p></div>`;
    scrollTop();
  }
  function nextQuestion(){
    if(state.answers[state.current]===null)return;
    if(state.current===BANK.length-1){const result=calculateResult();state.currentResult=result;state.answers=Array(BANK.length).fill(null);storageRemove(ANSWER_STORAGE);storageSet(STORAGE,encodeResult(result));setUrlSearch('r='+encodeResult(result)+(state.inviterToken?'&with='+state.inviterToken:''));renderResult(result);return;}
    state.current++;
    storageSet(ANSWER_STORAGE,JSON.stringify({answers:state.answers,current:state.current}));
    renderQuiz();
  }
  function axisInsights(result){return AXES.map(a=>{
    const val=result.scores[a.id], high=val>=50;
    return `<div class="insight"><strong>${a.title} — ${high?a.high:a.low}寄り</strong><p>${high?a.explainHigh:a.explainLow}</p></div>`;
  }).join('');}
  function scoreBar(label,value,left=null,right=null){return `<div class="stat-row"><div class="stat-labels"><span>${label}</span><strong>${value}<span style="color:#747887;font-weight:400"> / 100</span></strong></div><div class="bar"><div class="bar-fill" style="width:${value}%"></div></div>${left?`<div class="axis-name"><span>${left}</span><span>${right}</span></div>`:''}</div>`;}
  function matchScore(a,b){
    const diffs=AXES.map(x=>Math.abs(a.scores[x.id]-b.scores[x.id]));
    const bonusDiffs=BONUSES.map(x=>Math.abs(a.scores[x.id]-b.scores[x.id]));
    return clamp(Math.round(100-diffs.reduce((s,x)=>s+x,0)/4*.5-bonusDiffs.reduce((s,x)=>s+x,0)/4*.15),0,100);
  }
  function renderCompatibility(a,b){
    const score=matchScore(a,b),at=getType(a),bt=getType(b);
    const line=score>=80?'会話のテンポが近め。ただし似ているからこそ譲れない場面も。':score>=65?'いい感じに共鳴する2人。ズレもネタにできそう。':score>=45?'違いがいいスパイスに。相手のテンションを読み間違えないのがコツ。':'かなり違うネット生態系。だからこそ、お互いが未知のコンテンツ。';
    return `<section class="compare-panel" id="compatibility"><div class="eyebrow">FRIENDSHIP MODE</div><h2 style="margin-top:12px">2人のネット相性</h2><div class="versus"><div class="person"><div class="emoji">${at.emoji}</div><strong>あなた<br>${at.name}</strong></div><span class="vs">VS</span><div class="person"><div class="emoji">${bt.emoji}</div><strong>友達<br>${bt.name}</strong></div></div><div style="display:flex;align-items:end;gap:16px"><div class="score-big">${score}<span style="font-size:20px;letter-spacing:0">%</span></div><span style="color:#b5aebf;font-size:12px;padding-bottom:10px">遊びの相性スコア</span></div><p>${line}</p><p class="disclaimer">※8項目のスコアの近さによる演出上の指標です。人間関係の良し悪しや心理学的相性を保証するものではありません。</p></section>`;
  }

  function renderStorySection(code){
    const t=TYPES[code], story=TYPE_STORIES[code];
    return `<section class="story-section" aria-label="${t.name}の詳しい人物像">
      <div class="story-head"><div class="eyebrow">PERSONALITY DEEP DIVE</div><h2>「${t.name}」という生き物。</h2><p>ネットでの振る舞いを、もう少し具体的にのぞいてみよう。</p></div>
      <p class="story-lead">${story.personality}</p>
      <div class="story-grid">
        <article class="story-item"><span class="story-index">01 / HABITS</span><h3>ついやってしまう癖</h3><p>${story.habits}</p></article>
        <article class="story-item"><span class="story-index">02 / SCENES</span><h3>こんな場面、ありませんか？</h3><p>${story.scene}</p></article>
        <article class="story-item story-full"><span class="story-index">03 / OTHERS</span><h3>周りから見たあなた</h3><p>${story.others}</p></article>
      </div>
    </section>`;
  }
  function renderTypeDetail(code){
    if(!Object.prototype.hasOwnProperty.call(TYPES,code))return renderHome();
    const t=TYPES[code],codes=Object.keys(TYPES),i=codes.indexOf(code);
    app.innerHTML=`<div class="type-detail-wrap"><button class="text-back" data-action="home">← 16タイプ一覧に戻る</button>
      <section class="type-detail-hero"><div class="eyebrow">NET/TYPE ARCHIVE · ${code}</div><div class="detail-hero-inner"><div><h1>${t.name}</h1><p class="tagline">「${t.tagline}」</p><p class="detail-summary">${t.desc}</p></div><div class="detail-emoji" aria-hidden="true">${t.emoji}</div></div><div class="trait-list">${t.traits.map(x=>`<span class="trait"># ${x}</span>`).join('')}</div></section>
      ${renderStorySection(code)}
      <div class="result-panel detail-pros"><h2>このタイプの取扱説明書</h2><div class="insight"><strong>✦ 強み</strong><p>${t.good}</p></div><div class="insight"><strong>✦ 気をつけたいこと</strong><p>${t.bad}</p></div></div>
      <div class="type-page-actions"><button class="btn btn-outline" data-action="type-detail" data-code="${codes[(i+15)%16]}">← 前のタイプ</button><button class="btn btn-outline" data-action="type-detail" data-code="${codes[(i+1)%16]}">次のタイプ →</button></div>
      <p class="disclaimer">※この解説はネット文化を題材にした娯楽文章であり、特定の人に必ず当てはまるものではありません。</p>
      <div class="below-actions"><button class="btn btn-primary" data-action="start">自分のタイプを診断する ↗</button><button class="btn btn-outline" data-action="home">16タイプに戻る</button></div></div>`;
    scrollTop();
  }

  function renderResult(result,{demo=false}={}){
    const t=getType(result),score=result.scores;
    state.currentResult=result;
    const bonusStats=BONUSES.map(x=>scoreBar(x.label,score[x.id])).join('');
    const tieWarning=AXES.filter(a=>score[a.id]===50).length>=2?'複数の基本軸でちょうど中間の回答となっています。16タイプへの割り当ては便宜的なもので、境界にいる可能性があります。':'';
    app.innerHTML=`<div class="result-wrap"><section class="result-hero"><div class="result-kicker"><span>YOUR INTERNET PERSONALITY</span><span>${demo?'DEMO RESULT':'DIAGNOSIS COMPLETE ✳'}</span></div><div class="result-feature"><div><div class="type-code">TYPE ${result.code} / 16</div><h1>${t.name}</h1><p class="tagline">「${t.tagline}」</p><p class="type-desc">${t.desc}</p></div><div class="display-emoji" aria-hidden="true">${t.emoji}</div></div><div class="trait-list">${t.traits.map(x=>`<span class="trait"># ${x}</span>`).join('')}</div>${tieWarning?`<p class="disclaimer" style="margin-top:15px;color:#e8ce92">※ ${tieWarning}</p>`:''}<div class="result-actions"><button class="btn btn-primary" data-action="save">結果画像を保存 ↓</button><button class="btn btn-outline" data-action="share">結果をシェア ↗</button><button class="btn btn-outline" data-action="copy">結果リンクをコピー</button></div></section>
      ${state.inviter?renderCompatibility(result,state.inviter):''}
      ${renderStorySection(result.code)}
      <div class="result-body"><section class="result-panel"><h2>あなたのネット属性</h2><p class="subtitle">4つの基本軸からタイプを判定。追加4項目は遊びの補助スコアです。</p>${AXES.map(a=>scoreBar(a.scoreLabel,score[a.id],a.low,a.high)).join('')}<div style="height:1px;background:#343744;margin:25px 0"></div><h2 style="font-size:17px">さらに4つの隠れ属性</h2>${bonusStats}</section><section class="result-panel"><h2>あなたの取扱説明書</h2><p class="subtitle">長所も、ちょっと残念なところも。</p><div class="insight"><strong>✦ ここが強み</strong><p>${t.good}</p></div><div class="insight"><strong>✦ ちょっと注意</strong><p>${t.bad}</p></div>${axisInsights(result)}<p class="disclaimer" style="margin-top:19px">診断結果はエンタメ用に設計した独自の分類です。数値は回答傾向を0〜100に換算したもので、母集団内の順位や「該当確率」ではありません。</p></section></div>
      <section class="compare-panel" style="background:linear-gradient(110deg,#25302b,#1a2026)"><div class="eyebrow">BRING A FRIEND</div><h2 style="margin-top:13px">友達は何タイプ？</h2><p>リンクを送ると、友達が診断したあとで2人の結果を比較できます。アカウント登録なし・名前の入力なし。</p><button class="btn btn-primary" data-action="invite">友達に相性リンクを送る ↗</button><p class="disclaimer" style="margin-top:12px">相性リンクには、あなたのタイプと8つのスコアが含まれます。公開してよい相手にだけ送ってください。</p></section>
      <section class="premium"><div><div class="eyebrow" style="color:var(--pink)">COMING SOON · PREMIUM REPORT</div><div class="premium-title">さらに深い、ネット人格の裏側。</div><p>同じ16タイプでも人によって違う「隠れた癖」や、追加質問による詳細レポートを企画中。</p><div class="premium-note">※現在は未販売・決済なし。表示価格は予定案です。</div></div><div><div class="premium-price">¥290 <span style="font-size:12px;color:#b7b0bf">予定</span></div><button class="btn btn-soft btn-sm" disabled style="margin-top:10px">準備中</button></div></section>
      <div class="below-actions"><button class="btn btn-outline" data-action="start">もう一度診断する</button><button class="btn btn-outline" data-action="home">トップへ戻る</button></div></div>`;
    scrollTop();
  }
  function renderAbout(){
    app.innerHTML=`<div class="about-wrap"><div class="eyebrow">ABOUT NET/TYPE</div><h1>ネット人格診断について</h1><p>NET/TYPEは、日本のインターネット文化で使われる「冷笑」「スカし」「ドパガキ」「逆張り」などの言葉をヒントに制作した、オリジナルのエンタメ診断です。</p><h2>結果の決まり方</h2><p>28問の5段階回答から4つの基本軸（熱意への態度・場のノリへの反応・刺激志向・流行との距離）を計算し、組み合わせで16タイプを割り当てます。追加の4項目（承認欲求・SNS発信度・オタク濃度・炎上ウォッチ度）は各2問の補助的な目安です。科学的な妥当性や心理学的な診断精度は検証していません。</p><h2>データとプライバシー</h2><ul><li>回答処理はブラウザ内で完結し、診断結果と途中の回答は端末のローカルストレージに保存されます。</li><li>この試作品にはバックエンド・アクセス解析・決済・アカウント登録はありません。</li><li>結果リンクと相性リンクには、8つの属性スコアがURL内に含まれます。リンクを知っている人はこれを読み取れます。氏名やメールアドレスは収集しません。</li><li>ブラウザのサイトデータを削除すると、端末に保存された診断結果も消えます。</li></ul><h2>言葉の扱いについて</h2><p>ネットスラングは使われる文脈によって意味が変わります。タイプ名には自虐的なニュアンスやこのサービス独自の造語が含まれますが、人の優劣を決めるものではありません。</p><button class="btn btn-primary close-about" data-action="home">トップへ戻る →</button></div>`;
    scrollTop();
  }
  async function copyText(value){
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);notify('リンクをコピーしました');return;}}
    catch{}
    const textArea=document.createElement('textarea');
    textArea.value=value;textArea.style.position='fixed';textArea.style.top='-9999px';document.body.appendChild(textArea);textArea.focus();textArea.select();
    let done=false;try{done=document.execCommand('copy');}catch{}
    textArea.remove();
    if(done)notify('リンクをコピーしました');else notify('コピーできませんでした。URLを手動で共有してください。');
  }
  async function shareUrl(url,title){
    if(navigator.share){try{await navigator.share({title,text:title,url});return;}catch(err){if(err&&err.name==='AbortError')return;}}
    await copyText(url);
  }
  function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  function textWrap(ctx,text,x,y,maxWidth,lineHeight,maxLines=5){
    let line='',count=0;
    for(const char of text){
      if(ctx.measureText(line+char).width>maxWidth&&line){ctx.fillText(line,x,y+lineHeight*count);line=char;count++;if(count>=maxLines)return;}else{line+=char;}
    }
    if(line)ctx.fillText(line,x,y+lineHeight*count);
  }
  async function saveImage(result){
    const t=getType(result),s=result.scores;
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
    const ctx=canvas.getContext('2d');if(!ctx){notify('画像を作成できませんでした');return;}
    const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,'#292d34');bg.addColorStop(.5,'#181a25');bg.addColorStop(1,'#101219');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
    ctx.fillStyle='#c6ff79';ctx.fillRect(68,70,15,34);ctx.fillRect(89,79,15,25);ctx.fillRect(111,88,15,16);
    ctx.fillStyle='#fff';ctx.font='900 37px Arial, sans-serif';ctx.fillText('NET/TYPE',144,102);
    ctx.font='700 20px monospace';ctx.textAlign='right';ctx.fillStyle='#aeb1be';ctx.fillText('INTERNET PERSONALITY',1010,97);ctx.textAlign='left';
    ctx.strokeStyle='#ffffff28';ctx.beginPath();ctx.moveTo(68,141);ctx.lineTo(1012,141);ctx.stroke();
    ctx.fillStyle='#c6ff79';ctx.font='800 30px monospace';ctx.fillText('TYPE '+result.code+' / 16',70,222);
    ctx.font='190px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.textAlign='center';ctx.fillText(t.emoji,542,450);ctx.textAlign='left';
    ctx.fillStyle='#fff';let titleSize=67;ctx.font=`900 ${titleSize}px "Hiragino Sans","Yu Gothic",sans-serif`;while(ctx.measureText(t.name).width>940&&titleSize>44){titleSize-=2;ctx.font=`900 ${titleSize}px "Hiragino Sans","Yu Gothic",sans-serif`;}ctx.fillText(t.name,70,550);
    ctx.fillStyle='#dadce4';ctx.font='600 29px "Hiragino Sans","Yu Gothic",sans-serif';textWrap(ctx,'「'+t.tagline+'」',72,620,932,44,3);
    ctx.fillStyle='#c6ff79';ctx.font='800 23px monospace';ctx.fillText('INTERNET STATS',70,732);
    const bars=[...AXES.map(x=>[x.scoreLabel,s[x.id]]), ...BONUSES.map(x=>[x.label,s[x.id]])];
    bars.forEach(([label,val],i)=>{
      const x=i%2===0?70:559,y=785+Math.floor(i/2)*112;
      ctx.font='600 25px "Hiragino Sans","Yu Gothic",sans-serif';ctx.fillStyle='#f6f6f2';ctx.fillText(label,x,y);
      ctx.textAlign='right';ctx.font='800 27px monospace';ctx.fillStyle='#c6ff79';ctx.fillText(String(val),x+450,y);ctx.textAlign='left';
      ctx.fillStyle='#3d404b';roundedRect(ctx,x,y+18,450,15,8);ctx.fill();
      ctx.fillStyle=i<4?'#c6ff79':'#b99bff';roundedRect(ctx,x,y+18,450*val/100,15,8);ctx.fill();
    });
    ctx.strokeStyle='#ffffff28';ctx.beginPath();ctx.moveTo(68,1260);ctx.lineTo(1012,1260);ctx.stroke();
    ctx.fillStyle='#888b98';ctx.font='500 19px "Hiragino Sans","Yu Gothic",sans-serif';ctx.fillText('28 QUESTIONS  /  16 TYPES  /  FOR FUN ONLY',72,1299);
    ctx.textAlign='right';ctx.fillText('NET/TYPE LAB 2026',1010,1299);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob){notify('画像の作成に失敗しました');return;}
    const name=`nettype-${result.code}.png`;
    if(navigator.canShare&&navigator.share){
      const file=new File([blob],name,{type:'image/png'});
      try{if(navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'NET/TYPE 診断結果'});return;}}catch(err){if(err?.name==='AbortError')return;}
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),15000);
    notify('画像を作成しました。保存されない場合はブラウザの共有メニューから保存してください。');
  }
  function sampleResult(){
    const samples={cold:90,skim:85,dop:95,contrary:85,approval:35,posting:25,otaku:78,watch:92};
    renderResult({scores:samples,code:typeCode(samples)},{demo:true});
  }
  function loadParams(){
    const params=new URLSearchParams(location.search);
    state.inviterToken=null;state.inviter=null;
    if(params.has('with')){const invite=decodeResult(params.get('with'));if(invite){state.inviter=invite;state.inviterToken=params.get('with');}}
    if(params.has('r')){const result=decodeResult(params.get('r'));if(result){renderResult(result);return;}}
    renderHome();
  }
  // ユーザー操作（外部入力のHTML混入防止のため、引数は固定選択肢のみ）
  app.addEventListener('click',async evt=>{
    const choice=evt.target.closest('[data-choice]');
    if(choice){state.answers[state.current]=Number(choice.dataset.choice);storageSet(ANSWER_STORAGE,JSON.stringify({answers:state.answers,current:state.current}));renderQuiz();return;}
    const node=evt.target.closest('[data-action]');if(!node||node.disabled)return;
    const action=node.dataset.action;
    if(action==='type-detail')renderTypeDetail(node.dataset.code);
    else if(action==='start')startQuiz();
    else if(action==='resume'){const progress=getProgress();if(progress){state.answers=progress.answers;state.current=progress.current;renderQuiz();}else startQuiz();}
    else if(action==='next')nextQuestion();
    else if(action==='back'){if(state.current>0){state.current--;renderQuiz();}}
    else if(action==='home'){setUrlSearch('');state.inviter=null;state.inviterToken=null;renderHome();}
    else if(action==='sample'){sampleResult();}
    else if(action==='previous'){const val=decodeResult(storageGet(STORAGE));if(val){setUrlSearch('r='+encodeResult(val)+(state.inviterToken?'&with='+state.inviterToken:''));renderResult(val);}else notify('保存された結果が見つかりませんでした');}
    else if(action==='save'&&state.currentResult)await saveImage(state.currentResult);
    else if(action==='copy'&&state.currentResult)await copyText(resultLink(state.currentResult));
    else if(action==='share'&&state.currentResult){const t=getType(state.currentResult);await shareUrl(resultLink(state.currentResult),`ネット人格は「${t.name}」だった！ #ネット人格診断`);}
    else if(action==='invite'&&state.currentResult){await shareUrl(friendLink(state.currentResult),'ネット人格診断、私との相性を見てみよう！');}
  });
  document.getElementById('homeButton').addEventListener('click',()=>{state.inviter=null;state.inviterToken=null;setUrlSearch('');renderHome();});
  document.getElementById('aboutButton').addEventListener('click',renderAbout);
  document.getElementById('privacyButton').addEventListener('click',renderAbout);
  document.addEventListener('keydown',e=>{
    if(!app.querySelector('.question-wrap')||e.altKey||e.ctrlKey||e.metaKey||e.target instanceof HTMLInputElement)return;
    if(['1','2','3','4','5'].includes(e.key)){state.answers[state.current]=Number(e.key)-1;storageSet(ANSWER_STORAGE,JSON.stringify({answers:state.answers,current:state.current}));renderQuiz();}
    if(e.key==='Enter'&&state.answers[state.current]!==null){e.preventDefault();nextQuestion();}
  });
  window.addEventListener('popstate',loadParams);
  loadParams();
})();
