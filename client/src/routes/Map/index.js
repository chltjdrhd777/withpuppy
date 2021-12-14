import 보브 from '../../assets/img/icons/보브.png';
import 유나 from '../../assets/img/icons/유나.png';
import 이코 from '../../assets/img/icons/이코.png';
import 카덴 from '../../assets/img/icons/카덴.png';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import MapHeader from 'components/Header/Homeheader';
import { useDispatch } from 'react-redux';
import { addMap } from 'redux/Slices/Map';
import Example from './Example';
import { faBlackTie, faUber } from '@fortawesome/free-brands-svg-icons';
// import UserInfo from './UserInfo';
import Walk from 'components/Overlay/Walk';
import styled from 'styled-components';
import { Btn, SearchBar, SearchBtn, SearchContainer } from './MapStyle';
import UserInfo from './UserInfo';
import { BaseIcon } from 'components/Icon';
import petchingPuppyImg from '../../assets/img/profile/petchingPuppyImg.png';
import Icon2 from '../../assets/img/icons/Icon.png';
import { Row } from 'components/Footer/FooterStyle';
// import makeMarker from './utils';
import { customOverlay } from './customOverlay';
import ReactDOMServer from 'react-dom/server';
import CommentInput from './commentInput';
import Comment from './Comment';

const SEOUL_COORDINATION = [37.529789809685475, 126.96470201104091];

function Index() {
  const [comments, setComments] = useState([
    { id: 1, name: 'Minjoo Park', content: 'I like it!' },
  ]);

  const [like, setLike] = useState(0); //좋아요 버튼구현

  const nextId = useRef(1);

  const onInsert = useCallback(
    (name, content) => {
      const comment = {
        id: nextId.current,
        name,
        content,
      };
      console.log(name);
      console.log(content);
      setComments((comments) => comments.concat(comment));
      nextId.current += 1; //nextId 1씩 더하기
    },
    [comments],
  );

  const mapRef = useRef(null);
  const { kakao } = window;
  const dispatch = useDispatch();

  const [CommentLists, setCommentLists] = useState([]);
  const updateComment = (newComment) => {
    setCommentLists(CommentLists.concat(newComment));
  };

  const [isWalkOpen, setIsWalkOpen] = useState(false);
  const openWalkHandler = () => {
    setIsWalkOpen(!isWalkOpen);
  };
  const [inputText, setInputText] = useState('');
  const [place, setPlace] = useState('');

  const onChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPlace(inputText);
    setInputText('');
    console.log(inputText);
  };

  const [isMarkerSelected, setIsMarkerSelected] = useState(false);

  const [coordinate, setCoordinate] = useState([]);

  useEffect(() => {
    //console.log(new DOMParser().parseFromString(customOverlay, 'text/xml'));

    const mapOptions = {
      center: new kakao.maps.LatLng(...SEOUL_COORDINATION),
      level: 7,
    };

    //장소 검색시, 이를 좌표화.
    try {
      const map = new kakao.maps.Map(mapRef.current, mapOptions);

      dispatch(addMap(map));

      const ps = new kakao.maps.services.Places();
      ps.keywordSearch(place, placesSearchCB);

      // 주소-좌표 변환 객체를 생성
      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(place, placesSearchCB);

      function placesSearchCB(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
          let bounds = new kakao.maps.LatLngBounds();

          for (let i = 0; i < data.length; i++) {
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
            displayMarkerandOverlay(data[i]);
            coordinate.push([data[i].y, data[i].x]);
          }

          map.setBounds(bounds);
          console.log(coordinate);
        }
      }

      const imageCandidates = [보브, 이코, 유나, 카덴];
      const imageSrc =
          imageCandidates[Math.floor(Math.random() * imageCandidates.length)],
        imageSize = new kakao.maps.Size(40, 40),
        imageOption = { offset: new kakao.maps.Point(22, 69) };
      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption,
      );

      function displayMarkerandOverlay(place) {
        const position = new kakao.maps.LatLng(place.y, place.x);
        let marker = new kakao.maps.Marker({
          map: map,
          position: position,
          image: markerImage,
          clickable: true,
        });

        let wrapper = document.createElement('div');
        wrapper.innerHTML = customOverlay;
        // console.log(wrapper.firstChild);

        let closeBtn = wrapper.firstChild.querySelector('.close-button');
        // let doc = new DOMParser().parseFromString(customOverlay, 'text/html');
        // let closeBtn = doc.getElementsByClassName('close-button')[0];

        closeBtn.addEventListener('click', function () {
          console.log('hello world');
          overlay.setMap(null);
        });

        let contactBtn = wrapper.firstChild.querySelector('.contact-btn');
        contactBtn.addEventListener('click', function () {
          console.log('you clicked this!');
        });

        let overlay = new kakao.maps.CustomOverlay({
          content: wrapper.firstChild,
          map: map,
          position: marker.getPosition(),
          xAnchor: 1,
          yAnchor: 1,
        });

        // 마커에 클릭이벤트를 등록합니다
        kakao.maps.event.addListener(marker, 'click', function () {
          setIsMarkerSelected(true);
          overlay.setMap(map);
        });

        //장소가 바뀔 떄마다, 좌표들이 무한대로 늘어남을 방지하기 위해 비워준다.
        setCoordinate([]);

        marker.setMap(map);
        //오버레이들이 화면에 한방에 안뜨게 아예 마커만 보이게 설정
        overlay.setMap(null);
      }
    } catch (err) {
      console.log(err);
    }
    return () => {};
  }, [place]);

  return (
    <>
      <MapHeader className="mapHeader" />
      <MapMain>
        <MapContainer ref={mapRef} searchPlace={place} className="MapContainer">
          <SearchContainer className="inputForm" onSubmit={handleSubmit}>
            <SearchBar
              placeholder="장소 검색"
              onChange={onChange}
              value={inputText}
            ></SearchBar>
            <SearchBtn type="submit">검색</SearchBtn>
          </SearchContainer>
          <Btn onClick={openWalkHandler}>산책등록</Btn>
          {isWalkOpen === true ? (
            <Walk setIsWalkOpen={setIsWalkOpen}></Walk>
          ) : null}
        </MapContainer>
        <UserInfoContainer className="UserInfoContainer">
          <UserCard className="UserCard">
            <UserContainer>
              {isMarkerSelected ? (
                <>
                  <UserInfoWrapper>
                    <UserInfo />
                  </UserInfoWrapper>
                  <ReplyCon>
                    {/* <div style={{ marginBottom: '4rem' }}> */}
                    {comments.map((comment) => {
                      return (
                        <Comment
                          key={comment.id}
                          id={comment.id}
                          name={comment.name}
                          content={comment.content}
                        />
                      );
                    })}
                    {/* </div>{' '} */}
                    <CommentInput onInsert={onInsert} />
                  </ReplyCon>
                </>
              ) : (
                <ContentTitle>
                  <MainText>핀을 클릭해서 친구들을 만나보세요!</MainText>
                  <MainImg src={petchingPuppyImg}></MainImg>
                </ContentTitle>
              )}
            </UserContainer>
          </UserCard>
        </UserInfoContainer>
      </MapMain>
    </>
  );
}
const UserInfoWrapper = styled.div`
  flex-direction: column;
  min-height: 20rem;
  width: 100%;
`;

const ReplyCon = styled.div`
  background-color: #f7f1ed;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const ContentTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  width: 100%;
  height: 100%;
  background-color: #febeb0;
`;

const MainText = styled.div`
  text-align: center;
  color: white;
`;

const MainImg = styled.img`
  width: 70%;
  height: 70%;
  margin-left: 15px;
  justify-content: center;
`;
const MapMain = styled.main`
  display: flex;
  height: calc(100vh - 7rem);
  transform: translateY(7rem);
  & .MapContainer {
    flex: 0.65;
  }
  & .UserInfoContainer {
    flex: 0.35;
  }
  @media screen and (max-width: 1000px) {
    flex-direction: column;
    height: 102rem;
    & .MapContainer {
      min-height: 20rem;
      max-height: 35rem;
    }
    & .UserInfoContainer {
      flex: 1;
    }
  }
  @media screen and (min-width: 1400px) {
    & .MapContainer {
      flex: 0.75;
    }
    & .UserInfoContainer {
      flex: 0.25;
    }
  }
`;

const MapContainer = styled.div`
  min-height: 50rem;
`;

const UserInfoContainer = styled.div`
  background-color: white;
  /* background-color: ${({ theme }) => theme.colors.secondColor}; */
`;

//# When pin clicked
const UserCard = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 50rem;
  padding: 3rem;
  background-color: white;
  & .UserInfo {
    background-color: white;
    flex: 0.3;
  }
  & .Reply {
    background-color: red;
    flex: 0.7;
  }
`;

const UserContainer = styled.div`
  box-sizing: border-box;
  word-break: keep-all;
  /* padding: 1.3rem; */
  align-items: center;
  /* width: 500px;  */
  /* background-color: white; */
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;

  & .UserInfo {
    background-color: white;
    flex: 0.3;
  }
  & .Reply {
    background-color: yellow;
    flex: 0.7;
  }
`;
// const UserInfo = styled.div`
// flex-direction: column;
// min-height: 20rem;
// background: green;
// `;

const Reply = styled.div`
  /* justify-content: center;
    align-items: center;
    display: flex; */
`;

//# Before pin clicked

export default Index;
