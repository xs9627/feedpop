import { v4 as uuidv4 } from 'uuid';

/* global chrome */
chrome.runtime.getManifest.returns({version: "1.*.*"});
chrome.runtime.connect.returns({onMessage: { addListener: () => {}}});
chrome.storage.local.get.yields({});
chrome.storage.local.set.yields({});
chrome.storage.sync.get.yields({});
chrome.storage.sync.set.yields({});

const mockFeedItem = i => ({
  "content": "<div class=\"main-wrap content-wrap\">\n<div class=\"headline\">\n\n<div class=\"img-place-holder\"></div>\n\n\n\n</div>\n\n<div class=\"content-inner\">\n\n\n\n\n<div class=\"question\">\n<h2 class=\"question-title\"></h2>\n\n<div class=\"answer\">\n\n<div class=\"meta\">\n<img class=\"avatar\" src=\"https://images.weserv.nl/?url=pic2.zhimg.com/v2-6b6512ddd0dfdb105678291dc2c48f9d_is.jpg\">\n<span class=\"author\">田吉顺，</span><span class=\"bio\">丁香医生，丁香妈妈</span>\n</div>\n\n<div class=\"content\">\n<p>作为妇产科医生，说几个妇产科方面的谣言吧。倒不是让「我」深受其害，而是更严重，让很多女性都深受其害。</p>\n<p><em>谣言：月经是用来排毒的。</em></p>\n<p>体内确实会生成「毒素」。这里的毒素，指的是体内各种代谢产物，比如尿酸，如果体内大量堆积的话，真的是会影响身体健康。另外，还有一些外来成分，比如药物，或者吃进去的一些其他化学物，也都需要排出体外，维持身体内环境的「清洁」。这个「排毒」的脏器，主要是肾脏，「排毒」的行为，其实主要就是撒尿。</p>\n<p>所以，如果临床上谁的一天里的尿量太少了，达到「少尿」或者「无尿」的程度，我们就要担心肾脏是不是除了什么问题，从而会影响身体的健康。</p>\n<p>你看，如果真的要「排毒」，那得每天都得排；就算是肾脏功能不好了，需要做透析来帮助「排毒」，那也得是以周为单位。要是作为排毒的方法，一个月才能来那么一次，那效率就实在太低了。</p>\n<p>让毒素在体内停留一个月，想想就害怕。</p>\n<p>而且，还有些姑娘担心自己月经周期太短，就会老得快。那如果真的是月经用来排毒的话，周期短岂不是更好，排毒排得勤啊。</p>\n<p><strong>其实，这些说法都不对，月经周期短几天，不会让你老得快，21-35 天的周期，都是正常的。而月经也不是用来排毒的，月经里面没有毒。</strong></p>\n<p>月经，其实只是周期性剥脱的子宫内膜。</p>\n<p>作为孕育胎儿的器官，子宫就相当于一个房间。子宫壁，就相当于是一个房间的墙壁。作为房间的墙壁，中间是砖和水泥垒起来的，外面刷上外立面，里面涂上墙粉形成一层墙皮，所以房间墙壁也是分层的。</p>\n<p>子宫壁也一样，也分三层，外面的外立面叫浆膜层；中间的砖和水泥，叫肌层，其实就是子宫壁的肌肉，痛经的来源就是这里；里面的墙皮就是内膜层。月经，就是来源于内膜层的周期性剥脱。也就是说，这个房间的墙壁，会每个月掉一次墙皮。墙皮随着月经排出去，随后又有新的墙壁再长出来。</p>\n<p>所以，月经无非就是一点内膜组织和血液，和排毒没有半点关系。</p>\n<p>曾经有患者说，她月经量太少，比室友少多了，担心排毒不完全，对身体不好。其实，月经量只要＞5ml，就不是月经过少了。也就是说，整个月经周期的量，能湿透一片卫生巾，那就算正常量了。就不要比谁排的「毒」多了，真要是月经量过多，那才是要担心的，因为有些人持续月经量过多，会形成贫血，甚至有些人其实是由凝血功能异常造成的。</p>\n<p><strong>更没有必要因为担心排毒不够多，而再去买什么保健品甚至药物，一定要让自己的月经量多起来。那就真的是本来没病，也要给整出病来了。</strong></p>\n<p><strong>所以，月经和排毒，没有半毛钱关系，不要追求月经量多么多，一个周期的量能湿透一片卫生巾，也就不算少了。</strong></p>\n<p><em>谣言：阴道里面洗洗更健康。</em></p>\n<p>「洗洗更健康」可以说是一个家喻户晓的广告词，以至于非常多的成年女性的卫生间里，总是放着一瓶保持私处清洁的洗液。</p>\n<p>而这其实是完全没有必要的。</p>\n<p>正常情况下，阴道里面有 30 多种定植的微生物，它们所占比例大体固定，形成一个相互制约的平衡，没有哪个特别多或者特别少，从而维持阴道内环境的健康。</p>\n<p>但是，微生物毕竟也是生物，有时候 A 菌繁殖的多了点，随后其他菌种会对它产生制约影响，限制进一步繁殖，于是又回到正常分布状态。因此，我们称这个平衡为「动态平衡」。也就是说，这个平衡是在一个不断的轻微打破，然后重建的过程中实现的。</p>\n<p>所以，很多人偶尔会有一点外阴或者阴道的不适感，比如瘙痒，但是程度不严重，可能短时间一两天自己就好了，这就是阴道自身调节的作用，我们称为「阴道自净功能」。</p>\n<p>而这个时候如果做阴道内冲洗，反而人为干预打破了这个自我调节的系统。冲洗之后，阴道要重新建立新的稳定结构，一方面需要更长时间；另一方面，在建立平衡的过程中也容易出现偏差，使得某种细菌或者微生物增长过快，结果出现疾病。</p>\n<p><strong>所以，不是洗洗更健康，反而是本来很健康的，会洗出毛病来。</strong></p>\n<p>因此，临床上不建议患者自己做任何的阴道内冲洗。如果有医生开出冲洗阴道的洗液，那也不要去配，下次换个医生就行了，因为这个医生的专业水平有待提高。</p>\n<p>而如果要清洗外阴的话，最好的洗液，就是清水。而且不建议使用浴花清洗外阴。只要洗干净手，撩着清水清洗外阴，也就足够了。</p>\n<p><strong>再强调一遍，任何时候都不要自己做阴道内冲洗，包括月经期或者性生活前后，都不应该冲洗阴道。</strong></p>\n<p><em>谣言：不遵守月子里的禁忌，就会得月子病。</em></p>\n<p>在整个怀孕过程中，女性身体的变化，远不止肚子大起来这么简单，而是全身各个系统都产生了巨大变化。那么，在分娩结束后，也绝不是马上就可以恢复到怀孕前的状态的，而是需要一个相对比较长的时间。这段时间被称为产褥期，一般认为是大约 6 周。</p>\n<p>所以，生完孩子确实有一段时间比较特殊。如果说，把医学上的产褥恢复称为坐月子的话，那么，这个「月子」也确实需要坐。</p>\n<p>但是，传说中传统的坐月子，却又包含了很多稀奇古怪的内容。比如说，在月子里房间不让通风，甚至还要捂上厚厚的被子，所谓「捂月子」；产妇不能洗头洗澡，连牙都不能刷；饮食禁忌颇多，生冷海鲜通通远离，说这是「发物」，对伤口不好；另外，让产妇尽量不要下地，更不要说到户外了。</p>\n<p>而如果你胆敢不遵从，那么就要咒你要落下「月子病」。这东西可不好惹，一旦落下就是一辈子的事儿，要想好，你得再生一个，然后按规则坐月子才成！</p>\n<p><strong>对于上面这些坐月子的传统，以及「月子病」的说法，那就完全属于谣言陋习，应该被丢进垃圾箱了。如果真按这些方法坐月子，产妇得到的不是恢复，而是伤害。</strong></p>\n<p>比如，几乎每年夏天都有因为捂月子而中暑死亡的报道。正是因为所谓「捂月子」的陋习，才产生了一种完全中国特色的疾病——产褥中暑。</p>\n<p>产褥中暑一度是中国孕产妇死亡前五位的死因，但是国外却完全没有相关研究。因为只有中国有所谓的「捂月子」，而国外根本就没有这种要命的风俗。如果产妇觉得热了，当然可以使用各种降温设备，根本就发展不到中暑这一步，自然也就没有必要去花费精力研究怎么处理了。</p>\n<p>再比如，关于产褥期发生深静脉血栓致死的报道，现在也越来越多的出现在新闻之中。就是因为月子里不让产妇下床，甚至大小便都要在床上进行，所谓「坐」月子。而产后凝血功能亢进，长期不动，容易形成下肢深静脉血栓，如果发生血栓脱落，就会造成栓塞，严重的会危及生命。</p>\n<p>这些坑娘的禁忌之所以流行，很大程度上是因为有个所谓「月子病」的诅咒，在吓唬产妇，不让她们接受正确的科学理念。但是，正规医学中并没有什么所谓「月子病」。很多所谓「月子病」，比如腰酸腿疼，手臂发麻，不过就是怀孕造成的骨骼系统的变化，多数产后 3-6 个月后就可以自己缓解了。</p>\n<p><strong>而生完孩子，人生还有几十年的路要走，这么长的时间里，总会有各种不舒服，得各种疾病。不管是不是女人、生不生孩子、坐不坐月子，人都是会生病的。不能因为生过孩子，就把什么不舒服都归结到「坐月子」上去。</strong></p>\n<p>所以，「月子病」根本就不是病，而是一个谣言，一种诅咒，严重危害着女性的身心健康。</p>\n<p><strong>不要相信什么「月子病」的鬼话了，产褥期最大的原则，就是尽量让产妇过得舒坦，吃可口饭菜，该洗澡洗澡，该刷牙刷牙，没事可以出门散散心。</strong></p>\n<p><strong>你要相信，医学，是用来帮助你，而不是来诅咒你的。</strong></p>\n</div>\n</div>\n\n\n<div class=\"view-more\"><a href=\"http://www.zhihu.com/question/265087784\">查看知乎讨论<span class=\"js-question-holder\"></span></a></div>\n\n</div>\n\n\n</div>\n</div><script type=\"“text/javascript”\">window.daily=true</script><img src=\"https://c.statcounter.com/9817960/0/cd27ea8d/1/\" style=\"border:none;\"><img src=\"https://www.google-analytics.com/collect?v=1&cid=1&t=pageview&tid=UA-67524843-2&dp=%2Fstory%2F9664845&dt=%E4%BB%8E%E5%B0%8F%E5%88%B0%E5%A4%A7%EF%BC%8C%E8%BF%99%E4%BA%9B%E8%B0%A3%E8%A8%80%E8%AE%A9%E6%88%91%E6%B7%B1%E5%8F%97%E5%85%B6%E5%AE%B3&dh=http%3A%2F%2Fdaily.zhihu.com\" style=\"border:none;\"><img src=\"https://hm.baidu.com/hm.gif?si=17f90a6635c236d1bf2b6679107f318d&u=http%3A%2F%2Fdaily.zhihu.com%2Fstory%2F9664845&tt=%E4%BB%8E%E5%B0%8F%E5%88%B0%E5%A4%A7%EF%BC%8C%E8%BF%99%E4%BA%9B%E8%B0%A3%E8%A8%80%E8%AE%A9%E6%88%91%E6%B7%B1%E5%8F%97%E5%85%B6%E5%AE%B3&et=0&nv=0&st=4&v=1.2.14&rnd=9562194596\" style=\"border:none;\">",
  "contentSnippet": "田吉顺，丁香医生，丁香妈妈\n\n\n\n作为妇产科医生，说几个妇产科方面的谣言吧。倒不是让「我」深受其害，而是更严重，让很多女性都深受其害。\n谣言：月经是用来排毒的。\n体内确实会生成「毒素」。这里的毒素，指的是体内各种代谢产物，比如尿酸，如果体内大量堆积的话，真的是会影响身体健康。另外，还有一些外来成分，比如药物，或者吃进去的一些其他化学物，也都需要排出体外，维持身体内环境的「清洁」。这个「排毒」的脏器，主要是肾脏，「排毒」的行为，其实主要就是撒尿。\n所以，如果临床上谁的一天里的尿量太少了，达到「少尿」或者「无尿」的程度，我们就要担心肾脏是不是除了什么问题，从而会影响身体的健康。\n你看，如果真的要「排毒」，那得每天都得排；就算是肾脏功能不好了，需要做透析来帮助「排毒」，那也得是以周为单位。要是作为排毒的方法，一个月才能来那么一次，那效率就实在太低了。\n让毒素在体内停留一个月，想想就害怕。\n而且，还有些姑娘担心自己月经周期太短，就会老得快。那如果真的是月经用来排毒的话，周期短岂不是更好，排毒排得勤啊。\n其实，这些说法都不对，月经周期短几天，不会让你老得快，21-35 天的周期，都是正常的。而月经也不是用来排毒的，月经里面没有毒。\n月经，其实只是周期性剥脱的子宫内膜。\n作为孕育胎儿的器官，子宫就相当于一个房间。子宫壁，就相当于是一个房间的墙壁。作为房间的墙壁，中间是砖和水泥垒起来的，外面刷上外立面，里面涂上墙粉形成一层墙皮，所以房间墙壁也是分层的。\n子宫壁也一样，也分三层，外面的外立面叫浆膜层；中间的砖和水泥，叫肌层，其实就是子宫壁的肌肉，痛经的来源就是这里；里面的墙皮就是内膜层。月经，就是来源于内膜层的周期性剥脱。也就是说，这个房间的墙壁，会每个月掉一次墙皮。墙皮随着月经排出去，随后又有新的墙壁再长出来。\n所以，月经无非就是一点内膜组织和血液，和排毒没有半点关系。\n曾经有患者说，她月经量太少，比室友少多了，担心排毒不完全，对身体不好。其实，月经量只要＞5ml，就不是月经过少了。也就是说，整个月经周期的量，能湿透一片卫生巾，那就算正常量了。就不要比谁排的「毒」多了，真要是月经量过多，那才是要担心的，因为有些人持续月经量过多，会形成贫血，甚至有些人其实是由凝血功能异常造成的。\n更没有必要因为担心排毒不够多，而再去买什么保健品甚至药物，一定要让自己的月经量多起来。那就真的是本来没病，也要给整出病来了。\n所以，月经和排毒，没有半毛钱关系，不要追求月经量多么多，一个周期的量能湿透一片卫生巾，也就不算少了。\n谣言：阴道里面洗洗更健康。\n「洗洗更健康」可以说是一个家喻户晓的广告词，以至于非常多的成年女性的卫生间里，总是放着一瓶保持私处清洁的洗液。\n而这其实是完全没有必要的。\n正常情况下，阴道里面有 30 多种定植的微生物，它们所占比例大体固定，形成一个相互制约的平衡，没有哪个特别多或者特别少，从而维持阴道内环境的健康。\n但是，微生物毕竟也是生物，有时候 A 菌繁殖的多了点，随后其他菌种会对它产生制约影响，限制进一步繁殖，于是又回到正常分布状态。因此，我们称这个平衡为「动态平衡」。也就是说，这个平衡是在一个不断的轻微打破，然后重建的过程中实现的。\n所以，很多人偶尔会有一点外阴或者阴道的不适感，比如瘙痒，但是程度不严重，可能短时间一两天自己就好了，这就是阴道自身调节的作用，我们称为「阴道自净功能」。\n而这个时候如果做阴道内冲洗，反而人为干预打破了这个自我调节的系统。冲洗之后，阴道要重新建立新的稳定结构，一方面需要更长时间；另一方面，在建立平衡的过程中也容易出现偏差，使得某种细菌或者微生物增长过快，结果出现疾病。\n所以，不是洗洗更健康，反而是本来很健康的，会洗出毛病来。\n因此，临床上不建议患者自己做任何的阴道内冲洗。如果有医生开出冲洗阴道的洗液，那也不要去配，下次换个医生就行了，因为这个医生的专业水平有待提高。\n而如果要清洗外阴的话，最好的洗液，就是清水。而且不建议使用浴花清洗外阴。只要洗干净手，撩着清水清洗外阴，也就足够了。\n再强调一遍，任何时候都不要自己做阴道内冲洗，包括月经期或者性生活前后，都不应该冲洗阴道。\n谣言：不遵守月子里的禁忌，就会得月子病。\n在整个怀孕过程中，女性身体的变化，远不止肚子大起来这么简单，而是全身各个系统都产生了巨大变化。那么，在分娩结束后，也绝不是马上就可以恢复到怀孕前的状态的，而是需要一个相对比较长的时间。这段时间被称为产褥期，一般认为是大约 6 周。\n所以，生完孩子确实有一段时间比较特殊。如果说，把医学上的产褥恢复称为坐月子的话，那么，这个「月子」也确实需要坐。\n但是，传说中传统的坐月子，却又包含了很多稀奇古怪的内容。比如说，在月子里房间不让通风，甚至还要捂上厚厚的被子，所谓「捂月子」；产妇不能洗头洗澡，连牙都不能刷；饮食禁忌颇多，生冷海鲜通通远离，说这是「发物」，对伤口不好；另外，让产妇尽量不要下地，更不要说到户外了。\n而如果你胆敢不遵从，那么就要咒你要落下「月子病」。这东西可不好惹，一旦落下就是一辈子的事儿，要想好，你得再生一个，然后按规则坐月子才成！\n对于上面这些坐月子的传统，以及「月子病」的说法，那就完全属于谣言陋习，应该被丢进垃圾箱了。如果真按这些方法坐月子，产妇得到的不是恢复，而是伤害。\n比如，几乎每年夏天都有因为捂月子而中暑死亡的报道。正是因为所谓「捂月子」的陋习，才产生了一种完全中国特色的疾病——产褥中暑。\n产褥中暑一度是中国孕产妇死亡前五位的死因，但是国外却完全没有相关研究。因为只有中国有所谓的「捂月子」，而国外根本就没有这种要命的风俗。如果产妇觉得热了，当然可以使用各种降温设备，根本就发展不到中暑这一步，自然也就没有必要去花费精力研究怎么处理了。\n再比如，关于产褥期发生深静脉血栓致死的报道，现在也越来越多的出现在新闻之中。就是因为月子里不让产妇下床，甚至大小便都要在床上进行，所谓「坐」月子。而产后凝血功能亢进，长期不动，容易形成下肢深静脉血栓，如果发生血栓脱落，就会造成栓塞，严重的会危及生命。\n这些坑娘的禁忌之所以流行，很大程度上是因为有个所谓「月子病」的诅咒，在吓唬产妇，不让她们接受正确的科学理念。但是，正规医学中并没有什么所谓「月子病」。很多所谓「月子病」，比如腰酸腿疼，手臂发麻，不过就是怀孕造成的骨骼系统的变化，多数产后 3-6 个月后就可以自己缓解了。\n而生完孩子，人生还有几十年的路要走，这么长的时间里，总会有各种不舒服，得各种疾病。不管是不是女人、生不生孩子、坐不坐月子，人都是会生病的。不能因为生过孩子，就把什么不舒服都归结到「坐月子」上去。\n所以，「月子病」根本就不是病，而是一个谣言，一种诅咒，严重危害着女性的身心健康。\n不要相信什么「月子病」的鬼话了，产褥期最大的原则，就是尽量让产妇过得舒坦，吃可口饭菜，该洗澡洗澡，该刷牙刷牙，没事可以出门散散心。\n你要相信，医学，是用来帮助你，而不是来诅咒你的。\n\n\n\n\n查看知乎讨论\n\n\n\n\n\nwindow.daily=true",
  "id": `http://daily.zhihu.com/story/9664845-test-${i}`,
  "isoDate": new Date(new Date() - 1000 * 60 * 60 * i).toISOString(),
  "link": `http://daily.zhihu.com/story/9664845-test-${i}`,
  "pubDate": new Date(new Date() - 1000 * 60 * 60 * i).toISOString(),
  "readerId": uuidv4(),
  "title": `从小到大，这些谣言让我深受其害-test-${i}`
});
const mockFeedItem2 = i => ({
  "content": `/arrow-9.x/whyred/Arrow-v9.0-whyred-OFFICIAL-20181210.zip-test-${i}`,
  "contentSnippet": "/arrow-9.x/whyred/Arrow-v9.0-whyred-OFFICIAL-20181210.zip",
  "guid": `https://sourceforge.net/projects/arrow-os/files/arrow-9.x/whyred/Arrow-v9.0-whyred-OFFICIAL-20181210.zip/download-test-${i}`,
  "isoDate": new Date(new Date() - 1000 * 60 * 60 * i).toISOString(),
  "link": `https://sourceforge.net/projects/arrow-os/files/arrow-9.x/whyred/Arrow-v9.0-whyred-OFFICIAL-20181210.zip/download-test-${i}`,
  "pubDate": new Date(new Date() - 1000 * 60 * 60 * i).toISOString(),
  "readerId": uuidv4(),
  "title": `/arrow-9.x/whyred/Arrow-v9.0-whyred-OFFICIAL-20181210.zip-test-${i}`
});

const state = {
  "actionName": "List",
  "allUnreadCount": 136,
  "channelSelector": {
    "editOpen": false,
    "isCheckingUrl": false,
    "isUrlInvalid": false
  },
  "channelSelectorEditMode": false,
  "channels": [
    {
      "id": "fa9bb137-90f9-4ad0-8170-feb2592b8741",
      "name": "知乎日报",
      "unreadCount": 18,
      "url": "https://cors.io/?http://zhihurss.miantiao.me/dailyrss"
    },
    {
      "id": "f1f7de3e-c879-43de-af5c-7889937d30e1",
      "name": "Arrow OS",
      "unreadCount": 13,
      "url": "https://sourceforge.net/projects/arrow-os/rss?path=/arrow-9.x/whyred"
    },
    {
      "id": "2b97dbed-3d78-4f08-9970-e9c5afd4e493",
      "name": "爱范儿",
      "unreadCount": 60,
      "url": "https://cors.io/?http://www.ifanr.com/feed"
    },
    {
      "id": "09283a87-15a8-47b3-96e3-ad1dc37d5642",
      "name": "资讯中心_iMobile",
      "unreadCount": 18,
      "url": "http://news.imobile.com.cn/rss/news.xml"
    },
    {
      "id": "05de3388-09e7-4710-9243-5ac2bfd67759",
      "name": "虎嗅网",
      "unreadCount": 14,
      "url": "https://www.huxiu.com/rss/0.xml"
    },
    {
      "id": "19baea1c-23d1-4d2c-bc25-f82aecf3164c",
      "name": "36氪",
      "unreadCount": 26,
      "url": "https://36kr.com/feed"
    }
  ],
  "currentChannelId": "2b97dbed-3d78-4f08-9970-e9c5afd4e493",
  "currentFeedItemId": null,
  "feedContentTop": 0,
  "isShowActionMenu": false,
  "isTourOpen": false,
  "lastActiveState": {
    "currentChannelId": "fa9bb137-90f9-4ad0-8170-feb2592b8741",
    "currentFeedItemId": "7d4ad829-7993-4df6-9b2f-3f345a7553f5",
    "feedContentTop": 0,
    "showContent": false
  },
  "lastActiveTime": "2019-09-02T05:12:11.210Z",
  "logs": [
    {
      "date": "2018/12/12 上午7:45:40",
      "msg": "Update reader by background"
    },
  ],
  "maxFeedsCount": 500,
  "readerMessageBar": {
    "open": false
  },
  "refreshPeriod": 30,
  "showContent": true,
  "theme": "system",
  "recentFeeds": [
    {
      channelId: 'fa9bb137-90f9-4ad0-8170-feb2592b8741',
      feed: {
        "items": Array.from(Array(30).keys()).map(i => (mockFeedItem(i))),
        "lastBuildDate": "2019-01-15T12:09:58Z",
        "link": "https://daily.zhihu.com/",
        "title": "知乎日报"
      }
    },
    {
      channelId: 'f1f7de3e-c879-43de-af5c-7889937d30e1',
      feed: {
        "description": "Files from Arrow OS ArrowOS is an AOSP based open source project started with the aim of keeping things simple, clean and neat, both for the Android system and users. We understand the pain of unnecessary and sometimes rarely used mods/features being shipped with custom roms nowadays which may end up causing battery drains and/or memory leaks. This is being strictly avoided on our side keeping everything to a bare minimum, delivering the stable performance all the time without destroying the AOSP interface. With users getting more used to tweaks and features, we added just the right stuff that will be actually USEFUL at the end of the day.",
        "docs": "http://blogs.law.harvard.edu/tech/rss",
        "items": Array.from(Array(30).keys()).map(i => (mockFeedItem2(i))),
        "link": "https://sourceforge.net",
        "managingEditor": "noreply@sourceforge.net (SourceForge.net)",
        "pubDate": "Mon, 17 Dec 2018 08:47:40 UT",
        "title": "Arrow OS"
      }
    }
  ]
};

chrome.storage.local.get.withArgs('state').yields({state});

chrome.storage.local.get.withArgs('f-fa9bb137-90f9-4ad0-8170-feb2592b8741').yields({
    "f-fa9bb137-90f9-4ad0-8170-feb2592b8741": {
        "items": Array.from(Array(470).keys()).map(i => (mockFeedItem(i + 30)))
      }
});

chrome.storage.local.get.withArgs('f-f1f7de3e-c879-43de-af5c-7889937d30e1').yields({
  "f-f1f7de3e-c879-43de-af5c-7889937d30e1": {
    "items": Array.from(Array(300).keys()).map(i => (mockFeedItem2(i + 30)))
  },
});

chrome.storage.local.get.withArgs('f-2b97dbed-3d78-4f08-9970-e9c5afd4e493').yields({
  "f-2b97dbed-3d78-4f08-9970-e9c5afd4e493": {
    description: "让未来触手可及",
    feedUrl: "http://www.ifanr.com/feed",
    generator: "https://wordpress.org/?v=4.9.8",
    language: "zh-CN",
    lastBuildDate: "Thu, 31 Jan 2019 13:11:52 +0000",
    link: "https://www.ifanr.com?utm_source=rss&utm_medium=rss&utm_campaign=",
    title: "爱范儿",
    items: Array.from(Array(500).keys()).map(i => (mockFeedItem(i + 30)))
  },
});

/* global analytics */
analytics.getService = () => ({getTracker: () => ({sendAppView: () => {}})});