import Image from 'next/image';
import { useRef, useEffect, useState } from 'react'
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss'
import 'rc-slider/assets/index.css'
import Slider from 'rc-slider'
import { convertDurationToTimeString } from '../../utils/ConvertDurationToTimeString';

export function Player(){

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        togglePlay,
        playNext,
        playPrevious,
        isLooping,
        setPlayingState,
        hasNext,
        hasPrevious,
        toggleLoop,
        toggleShuffle,
        clearPlayerState,
        isShuffling
    } = usePlayer()

    useEffect(() => {
        if(!audioRef.current){
            return;
        }

        if(isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying])

    function setUpProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        })
    }

    function handleSeek(amount: number){
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded(){
        if(hasNext){
            playNext()
        } else {
            clearPlayerState()
        }
    }

    const episode = episodeList[currentEpisodeIndex];

    return(
        <div className={styles.playerConteiner}>
            <header>
                <img src="/playing.svg" alt="tocando agora" />
                <strong>Tocando agora</strong>
            </header>

            { episode ?(
                <div className={styles.currentEpisode}>
                    <Image width={592} height={592} src={episode.thumbnail} objectFit="cover" />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        { episode?(
                            <Slider
                            max={episode.duration}
                            value={progress}
                            onChange={handleSeek}
                            trackStyle={{ backgroundColor: '#04d361'}}
                            railStyle={{ backgroundColor: '#9f75ff'}}
                            handleStyle={{ borderColor: '#04d361'}}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                        
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio 
                    src={episode.url}
                    autoPlay
                    loop={isLooping}
                    ref = {audioRef}
                    onPlay={() => setPlayingState(true)}
                    onPause={() => setPlayingState(false)}
                    onEnded={handleEpisodeEnded}
                    onLoadedMetadata = {() => setUpProgressListener()}
                    />
                    ) }

                <div className={styles.buttons}>
                    <button
                      type="button"
                      disabled={!episode || episodeList.length === 1}
                      onClick={() => toggleShuffle()}
                      className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"></img>
                    </button>
                    <button type="button" onClick={() => playPrevious()} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"></img>
                    </button>
                    <button 
                    type="button" 
                    disabled={!episode} 
                    className={styles.playButton}
                    onClick={() => togglePlay()}
                    >
                        { isPlaying
                            ?<img src="/pause.svg" alt="Tocar"></img>
                            :<img src="/play.svg" alt="Pausar"></img>}
                    </button>
                    <button type="button" onClick={() => playNext()} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima"></img>
                    </button>
                    <button type="button" className={isLooping?styles.isActive:""} onClick={() => toggleLoop()} disabled={!episode}>
                        <img src="/repeat.svg" alt="Repetir"></img>
                    </button>
                </div>
            </footer>
        </div>
    )
}