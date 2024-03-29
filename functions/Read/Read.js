const { MongoClient } = require('mongodb');
const Input = require('../../input')

// async function show_top100(client){
//   await client.connect();
//   const result = await client.db("butube").collection("MUSIC").find({ music_rank: { $exists: true } }).toArray();
//   const formattedResults = result.map(item => {
//     return {
//       '순위': item.music_rank,
//       '곡명': item.music_name,
//       '가수': item.music_singer,
//       '테마': item.music_theme
//     };
//   });
//   // 수정된 결과를 테이블로 출력합니다.
//   console.table(formattedResults);
// };

// async function read_PL(client, id){
//   let result = await client.db("butube").collection("PLAYLIST").find({user_id : id}).project({_id : 0, playlist_name : 1}).toArray();
//   let formattedResults = result.map(item => {
//     return{
//       '플리 제목' : item.playlist_name
//     };
//   });
//   console.table(formattedResults);
// }

async function read_PL(client,ID){
  console.log(typeof(ID))
  let IntID = parseInt(ID)
  let result = await client.db('butube').collection("PLAYLIST").find({user_id : IntID}).project({_id :0, music_info : 0}).toArray();
  console.table(result)
}


async function read_all(client,colname){
  let result = await client.db('butube').collection(colname).find().project({_id :0}).toArray();
  console.table(result)
}


async function read_music(client, user_input, cmu_option) {
  let dbname = 'butube'
  let colname = 'MUSIC'
  console.log(`실행 ${colname}`);
  let music_list = [];

  if (cmu_option === '1') {
    const result = await client.db(dbname).collection(colname).find({}).toArray();
    result.forEach(info => {
      if (info.music_name.includes(user_input) || info.music_singer.includes(user_input)) {
        music_list.push({노래이름:info.music_name, 가수이름:info.music_singer})
      }
    });

    console.table(music_list);
  } else if (cmu_option === '2') {
    const result = await client.db(dbname).collection(colname).find({}).toArray();
    result.forEach(info => {
      if (info.music_theme.includes(user_input)) {
        music_list.push({노래이름:info.music_name, 가수이름:info.music_singer})
      }
    });
    console.table(music_list);
  };
}

// 장르 101번부터 50개씩 장르가 다른사람 플리로 생각하자 댄스, 발라드, 힙합, R&B, 록메탈, 트로트



//로그인 기능
async function login(client) {
  try {
    await client.connect();
    console.log("-------로그인-------")
    console.log("아이디를 입력해주세요.")
    let userID = await Input.uInput();

    let qry01 = { user_id: userID }
    const result01 = await client.db("butube").collection("USER").findOne(qry01);
    if (result01 === null) {
      console.log("존재하지 않는 아이디입니다.")
      process.exit();
    } else {
      let password = result01.user_pw
      console.log("비밀번호를 입력해주세요.")
      let userPW = await Input.uInput();
      if (password !== userPW) {
        console.log("잘못된 비밀번호입니다.");
        process.exit();
      } else {
        console.log("로그인이 완료되었습니다.")
      }
    }
    return userID;
  } catch (e) {
    console.log(e.message);
  }
}



async function show_top100(client){
      await client.connect();
      const result = await client.db("butube").collection("MUSIC").find({ music_rank: { $exists: true } }).toArray();
      const formattedResults = result.map(item => {
        return {
          '순위': item.music_rank,
          '곡명': item.music_name,
          '가수': item.music_singer,
          '테마': item.music_theme
        };
      });
      // 수정된 결과를 테이블로 출력합니다.
      console.table(formattedResults);
    };

// top100 기능

async function read_top100(client) {
  try {
    await client.connect();
    const result = await client.db("butube").collection("MUSIC").find({ music_rank: { $exists: true } }).toArray();
    const formattedResults = result.map(item => {
      return {
        '순위': item.music_rank,
        '곡명': item.music_name,
        '가수': item.music_singer,
        '테마': item.music_theme
      };
    });

    // 수정된 결과를 테이블로 출력합니다.
    console.table(formattedResults);

    // 사용자에게 곡명을 입력받습니다.
    while(true) {
    console.log('재생을 원하시는 곡명을 입력해주세요: ');
    const songName = await Input.uInput(); // 사용자로부터 입력을 받는다
    const song = result.find(item => item.music_name === songName);
    

    if (song) {
      const line = '-'.repeat(50);
      console.log(line);
      console.log(`(재생중) ${song.music_rank} ${song.music_name} - ${song.music_singer}`);
      console.log(line);

      // 현재 곡 정보 저장
      let currentSong = song;
      // 메뉴 출력 및 선택 처리
      function showMenu() {
        console.log('1. 셔플 2. 뒤로가기 3. 앞으로가기 4. 종료하기');
      }

      async function handleMenu() {
        const input = await Input.uInput();
        switch (input) {
      // 셔플 기능 구현
        case '1':
          const randomId = Math.floor(Math.random() * 100) + 1; // 1부터 100까지의 랜덤한 값 생성
          const randomSong = await client.db("butube").collection("MUSIC").findOne({ _id: randomId });
        
          if (randomSong) {
            console.log(line);
            console.log(`(재생중) ${randomSong.music_rank} ${randomSong.music_name} - ${randomSong.music_singer}`);
            console.log(line);
        
            // 현재 곡 정보 업데이트
            currentSong = randomSong;
        
            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
          } else {
            console.log('해당 곡을 찾을 수 없습니다.');
            break;
          }
          break;
        
          case '2':
            if (!currentSong) {
              console.log('현재 재생 중인 곡이 없습니다.');
              break;
            }


          
            const prevSong = await client.db("butube").collection("MUSIC").findOne({ _id: { $lt: currentSong._id } }, { sort: { _id: -1 } });
            if (!prevSong) {
              console.log('첫 번째 곡입니다.');
              break;
            }
          
            // 현재 곡 정보 업데이트
            currentSong = prevSong;
          
            // 이전 곡 정보 출력
            console.log(line);
            console.log(`(재생중) ${prevSong.music_rank} ${prevSong.music_name} - ${prevSong.music_singer}`);
            console.log(line);

            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
            break;
            
          case '3':
            if (!currentSong) {
              console.log('현재 재생 중인 곡이 없습니다.');
              break;
            }

            const nextSong = await client.db("butube").collection("MUSIC").findOne({ _id: { $gt: currentSong._id } });
            if (!nextSong) {
              console.log('마지막 곡입니다.');
              break;
            }

            // 현재 곡 정보 업데이트
            currentSong = nextSong;

            // 다음 곡 정보 출력
            console.log(line);
            console.log(`(재생중) ${nextSong.music_rank} ${nextSong.music_name} - ${nextSong.music_singer}`);
            console.log(line);

            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
            break;

          // case '4':
          //   // 댓글추가 기능 구현
          //   break;

          case '4':
          console.log("프로그램이 종료되었습니다.")
          process.exit()
          break;

          default: 
          console.log("잘못된 입력입니다.")
          
        }
      }

      showMenu();
      await handleMenu();

    } else {
      console.log('해당 곡을 찾을 수 없습니다. 곡명을 정확히 입력해주세요.');
    }
  }

  } catch (e) {
    console.log(e.message);
  } finally {
    console.log("please");
    await client.close();
    process.exit();
  }
}
//PL에서 노래재생
async function music_start_PL(client, PLName) {
  await client.connect();
  try {
    let qry01 = {playlist_name: PLName}
    const result01 = await client.db("butube").collection("PLAYLIST").findOne(qry01)

    // const result = await client.db("butube").collection("PLAYLIST").findOne({ playlist_name : PLName})
    // console.table(result)

    // 사용자에게 곡명을 입력받습니다.
    while(true) {
    console.log('재생을 원하시는 곡명을 입력해주세요: ');
    const songName = await Input.uInput(); // 사용자로부터 입력을 받는다
    for(const music of result01.music_info){
      if(music.music_name === songName){
        var song = music;
        break;
      }
    }


    if (song) {   
      let length = result01.music_info.length;          //객체의 갯수 저장

      const line = '-'.repeat(50);
      console.log(line);
      console.log(`(재생중) ${song.music_name} - ${song.music_singer}`);
      console.log(line);

      // 현재 곡 정보 저장
      let currentSong = song;
      let index = result01.music_info.indexOf(currentSong);
      // 메뉴 출력 및 선택 처리
      function showMenu() {
        console.log('1. 셔플 2. 뒤로가기 3. 앞으로가기 4. 종료하기');
      }

      async function handleMenu() {
        const input = await Input.uInput();

        switch (input) {
      // 셔플 기능 구현
        case '1':
          const randomId = Math.floor(Math.random() * length); // 1부터 객체의 갯수까지의 랜덤한 값 생성
          const randomSong = result01.music_info[randomId];


          if (randomSong) {
            console.log(line);
            console.log(`(재생중) ${randomSong.music_name} - ${randomSong.music_singer}`);
            console.log(line);
        
            // 현재 곡 정보 업데이트
            currentSong = randomSong;

            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
          } else {
            console.log('해당 곡을 찾을 수 없습니다.');
            break;
          }
          break;
        
          case '2':
            if (!currentSong) {
              console.log('현재 재생 중인 곡이 없습니다.');
              break;
            }
          
            const prevSong = result01.music_info[index -1];
            if (!prevSong) {
              console.log('첫 번째 곡입니다.');
              break;
            }
          
            // 현재 곡 정보 업데이트
            currentSong = prevSong;
            index = result01.music_info.indexOf(currentSong);
          
            // 이전 곡 정보 출력
            console.log(line);
            console.log(`(재생중) ${prevSong.music_name} - ${prevSong.music_singer}`);
            console.log(line);

            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
            break;
            
          case '3':
            if (!currentSong) {
              console.log('현재 재생 중인 곡이 없습니다.');
              break;
            }

            const nextSong = result01.music_info[index +1];
            if (!nextSong) {
              console.log('마지막 곡입니다.');
              break;
            }

            // 현재 곡 정보 업데이트
            currentSong = nextSong;
            index = result01.music_info.indexOf(currentSong);

            // 다음 곡 정보 출력
            console.log(line);
            console.log(`(재생중) ${nextSong.music_name} - ${nextSong.music_singer}`);
            console.log(line);

            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
            break;

          // case '4':
          //   // 댓글추가 기능 구현
          //   break;

          case '4':
          console.log("프로그램이 종료되었습니다.")
          process.exit()
          break;

          default: 
          console.log("잘못된 입력입니다.")
          
        }
      }

      showMenu();
      await handleMenu();

    } else {
      console.log('해당 곡을 찾을 수 없습니다. 곡명을 정확히 입력해주세요.');
    }
  }

  } catch (e) {
    console.log(e.message);
  }
}

// 플레이리스트 선택 후 음악 리스트 출력 기능
async function select_PL(client, PLName) {
  try{
    let qry01 = {playlist_name: PLName}
    const result01 = await client.db("butube").collection("PLAYLIST").findOne(qry01)
    if (!result01) {
      console.log("해당하는 플레이리스트가 존재하지 않습니다.")
    }else{
      console.log(`---------------"${PLName}"---------------`);
      console.table(result01.music_info,['music_name','music_singer'])
    }
  }catch(e){
    console.log(e.message);
  }
}


module.exports = { login, read_music, read_top100, select_PL ,read_PL, show_top100, read_all, music_start_PL};
