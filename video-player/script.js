document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM
    const videoPlayer = document.getElementById('videoPlayer');
    const video = document.getElementById('video');
    const bigPlayButton = document.querySelector('.big-play-button');
    const playButton = document.querySelector('.play-button');
    const progressBar = document.querySelector('.progress-bar');
    const progressFilled = document.querySelector('.progress-filled');
    const progressHoverTime = document.querySelector('.progress-hover-time');
    const currentTimeDisplay = document.querySelector('.current-time');
    const totalTimeDisplay = document.querySelector('.total-time');
    const fullscreenButton = document.querySelector('.fullscreen-button');
    const themeToggle = document.querySelector('.theme-toggle');
    const episodesButton = document.querySelector('.episodes-button');
    const episodesPanel = document.querySelector('.episodes-panel');
    const closeEpisodes = document.querySelector('.close-episodes');
    const skipIntroButton = document.querySelector('.skip-intro-button');
    const prevEpisodeButton = document.querySelector('.prev-episode');
    const nextEpisodeButton = document.querySelector('.next-episode');
    const seasonButtons = document.querySelectorAll('.season-button');
    const episodesContainer = document.querySelector('.episodes-container');
    const translationOptions = document.querySelectorAll('.translation-option');
    
    // Состояние плеера
    let isPlaying = false;
    let isDarkTheme = true;
    let currentSeason = 1;
    let currentEpisode = 1;
    let hideControlsTimeout;
    let lastTapTime = 0;
    let lastTapX = 0;
    
    // Данные о сериях
    const episodes = {
        1: [
            { id: 1, title: 'Пилотная серия', duration: '42:30', thumbnail: 'assets/ep1.jpg' },
            { id: 2, title: 'Новые горизонты', duration: '41:15', thumbnail: 'assets/ep2.jpg' },
            { id: 3, title: 'Неожиданный поворот', duration: '43:05', thumbnail: 'assets/ep3.jpg' },
            { id: 4, title: 'Тайны прошлого', duration: '40:55', thumbnail: 'assets/ep4.jpg' },
            { id: 5, title: 'Решающий момент', duration: '44:20', thumbnail: 'assets/ep5.jpg' }
        ],
        2: [
            { id: 1, title: 'Новое начало', duration: '43:10', thumbnail: 'assets/s2ep1.jpg' },
            { id: 2, title: 'Старые друзья', duration: '42:25', thumbnail: 'assets/s2ep2.jpg' },
            { id: 3, title: 'Темные тайны', duration: '41:50', thumbnail: 'assets/s2ep3.jpg' }
        ],
        3: [
            { id: 1, title: 'Финальный сезон', duration: '45:00', thumbnail: 'assets/s3ep1.jpg' },
            { id: 2, title: 'Последняя битва', duration: '50:15', thumbnail: 'assets/s3ep2.jpg' }
        ]
    };
    
    // Инициализация плеера
    function initPlayer() {
        // Загрузка эпизодов для текущего сезона
        loadEpisodes(currentSeason);
        
        // Установка обработчиков событий
        setupEventListeners();
        
        // Обновление времени
        updateTimeDisplay();
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        // Воспроизведение/пауза при клике на большую кнопку
        bigPlayButton.addEventListener('click', togglePlay);
        
        // Воспроизведение/пауза при клике на маленькую кнопку
        playButton.addEventListener('click', togglePlay);
        
        // Клик на видео для воспроизведения/паузы
        video.addEventListener('click', togglePlay);
        
        // Обновление иконки при воспроизведении/паузе
        video.addEventListener('play', () => {
            videoPlayer.classList.add('playing');
            videoPlayer.classList.remove('paused');
            playButton.querySelector('i').className = 'fas fa-pause';
            isPlaying = true;
            startHideControlsTimer();
        });
        
        video.addEventListener('pause', () => {
            videoPlayer.classList.remove('playing');
            videoPlayer.classList.add('paused');
            playButton.querySelector('i').className = 'fas fa-play';
            isPlaying = false;
            clearTimeout(hideControlsTimeout);
        });
        
        // Обновление прогресс-бара
        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progressFilled.style.width = `${percent}%`;
            updateTimeDisplay();
        });
        
        // Перемотка при клике на прогресс-бар
        progressBar.addEventListener('click', (e) => {
            const progressTime = (e.offsetX / progressBar.offsetWidth) * video.duration;
            video.currentTime = progressTime;
        });
        
        // Отображение времени при наведении на прогресс-бар
        progressBar.addEventListener('mousemove', (e) => {
            const percent = e.offsetX / progressBar.offsetWidth;
            const previewTime = percent * video.duration;
            progressHoverTime.textContent = formatTime(previewTime);
            progressHoverTime.style.display = 'block';
            progressHoverTime.style.left = `${e.offsetX}px`;
        });
        
        progressBar.addEventListener('mouseout', () => {
            progressHoverTime.style.display = 'none';
        });
        
        // Полноэкранный режим
        fullscreenButton.addEventListener('click', toggleFullscreen);
        
        // Переключение темы
        themeToggle.addEventListener('click', toggleTheme);
        
        // Открытие/закрытие панели выбора серий
        episodesButton.addEventListener('click', toggleEpisodesPanel);
        closeEpisodes.addEventListener('click', toggleEpisodesPanel);
        
        // Пропуск заставки (имитация - перемотка на 1 минуту вперед)
        skipIntroButton.addEventListener('click', skipIntro);
        
        // Переключение между сезонами
        seasonButtons.forEach(button => {
            button.addEventListener('click', () => {
                const season = parseInt(button.dataset.season);
                changeSeason(season);
            });
        });
        
        // Переключение между переводами
        translationOptions.forEach(option => {
            option.addEventListener('click', () => {
                translationOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                // Здесь можно добавить логику смены аудиодорожки
            });
        });
        
        // Предыдущий/следующий эпизод
        prevEpisodeButton.addEventListener('click', playPreviousEpisode);
        nextEpisodeButton.addEventListener('click', playNextEpisode);
        
        // Обработка событий для мобильных устройств
        setupMobileEvents();
        
        // Загрузка метаданных видео
        video.addEventListener('loadedmetadata', updateTimeDisplay);
    }
    
    // Функция воспроизведения/паузы
    function togglePlay() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
        
        // Добавляем эффект пульсации для кнопки
        playButton.classList.add('pulse');
        setTimeout(() => {
            playButton.classList.remove('pulse');
        }, 300);
    }
    
    // Форматирование времени в MM:SS
    function formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Обновление отображения времени
    function updateTimeDisplay() {
        currentTimeDisplay.textContent = formatTime(video.currentTime);
        totalTimeDisplay.textContent = formatTime(video.duration || 0);
    }
    
    // Переключение полноэкранного режима
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) {
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) {
                videoPlayer.msRequestFullscreen();
            }
            fullscreenButton.querySelector('i').className = 'fas fa-compress';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fullscreenButton.querySelector('i').className = 'fas fa-expand';
        }
    }
    
    // Переключение темы
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        if (isDarkTheme) {
            document.body.classList.remove('light-theme');
            themeToggle.querySelector('i').className = 'fas fa-moon';
        } else {
            document.body.classList.add('light-theme');
            themeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }
    
    // Открытие/закрытие панели выбора серий
    function toggleEpisodesPanel() {
        episodesPanel.classList.toggle('active');
    }
    
    // Пропуск заставки (имитация - перемотка на 1 минуту вперед)
    function skipIntro() {
        video.currentTime += 60; // Перемотка на 60 секунд вперед
    }
    
    // Загрузка эпизодов для выбранного сезона
    function loadEpisodes(season) {
        episodesContainer.innerHTML = '';
        
        episodes[season].forEach(episode => {
            const episodeCard = document.createElement('div');
            episodeCard.className = 'episode-card';
            episodeCard.dataset.id = episode.id;
            
            // Используем заглушку для изображения, если нет реального
            const thumbnailSrc = episode.thumbnail || 'assets/poster.jpg';
            
            episodeCard.innerHTML = `
                <div class="episode-thumbnail" style="background-color: #333; display: flex; justify-content: center; align-items: center;">
                    <span style="color: white;">Эпизод ${episode.id}</span>
                </div>
                <div class="episode-info">
                    <div class="episode-number">Серия ${episode.id}</div>
                    <div class="episode-title">${episode.title}</div>
                </div>
            `;
            
            episodeCard.addEventListener('click', () => {
                playEpisode(season, episode.id);
                toggleEpisodesPanel();
            });
            
            episodesContainer.appendChild(episodeCard);
        });
    }
    
    // Смена сезона
    function changeSeason(season) {
        currentSeason = season;
        
        // Обновляем активную кнопку сезона
        seasonButtons.forEach(button => {
            if (parseInt(button.dataset.season) === season) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Загружаем эпизоды для выбранного сезона
        loadEpisodes(season);
    }
    
    // Воспроизведение выбранного эпизода
    function playEpisode(season, episodeId) {
        currentSeason = season;
        currentEpisode = episodeId;
        
        // В реальном приложении здесь бы менялся источник видео
        // Для демонстрации просто перезапускаем текущее видео
        video.currentTime = 0;
        video.play();
    }
    
    // Воспроизведение предыдущего эпизода
    function playPreviousEpisode() {
        let prevEpisode = currentEpisode - 1;
        let prevSeason = currentSeason;
        
        if (prevEpisode < 1) {
            prevSeason--;
            if (prevSeason < 1) {
                prevSeason = Object.keys(episodes).length;
            }
            prevEpisode = episodes[prevSeason].length;
        }
        
        playEpisode(prevSeason, prevEpisode);
    }
    
    // Воспроизведение следующего эпизода
    function playNextEpisode() {
        let nextEpisode = currentEpisode + 1;
        let nextSeason = currentSeason;
        
        if (nextEpisode > episodes[currentSeason].length) {
            nextSeason++;
            if (nextSeason > Object.keys(episodes).length) {
                nextSeason = 1;
            }
            nextEpisode = 1;
        }
        
        playEpisode(nextSeason, nextEpisode);
    }
    
    // Таймер скрытия элементов управления
    function startHideControlsTimer() {
        clearTimeout(hideControlsTimeout);
        
        const delay = isPlaying ? 3000 : 10000; // 3 секунды при воспроизведении, 10 при паузе
        
        hideControlsTimeout = setTimeout(() => {
            if (isPlaying) {
                document.querySelector('.top-panel').style.opacity = '0';
                document.querySelector('.bottom-panel').style.opacity = '0';
                document.querySelector('.episode-navigation').style.opacity = '0';
            }
        }, delay);
    }
    
    // Настройка событий для мобильных устройств
    function setupMobileEvents() {
        // Показать элементы управления при касании
        videoPlayer.addEventListener('touchstart', () => {
            document.querySelector('.top-panel').style.opacity = '1';
            document.querySelector('.bottom-panel').style.opacity = '1';
            document.querySelector('.episode-navigation').style.opacity = '1';
            
            startHideControlsTimer();
        });
        
        // Двойное нажатие для перемотки
        videoPlayer.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapX = e.changedTouches[0].clientX;
            const screenWidth = window.innerWidth;
            
            // Проверяем, было ли это двойным нажатием (интервал менее 300 мс)
            if (currentTime - lastTapTime < 300) {
                // Определяем, на какой стороне экрана было нажатие
                if (tapX < screenWidth / 2) {
                    // Левая сторона - перемотка назад на 10 секунд
                    video.currentTime = Math.max(0, video.currentTime - 10);
                } else {
                    // Правая сторона - перемотка вперед на 10 секунд
                    video.currentTime = Math.min(video.duration, video.currentTime + 10);
                }
                
                // Показываем индикатор перемотки
                const indicator = document.createElement('div');
                indicator.className = 'rewind-indicator';
                indicator.style.position = 'absolute';
                indicator.style.top = '50%';
                indicator.style.left = tapX < screenWidth / 2 ? '25%' : '75%';
                indicator.style.transform = 'translate(-50%, -50%)';
                indicator.style.color = 'white';
                indicator.style.fontSize = '24px';
                indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                indicator.style.padding = '15px';
                indicator.style.borderRadius = '50%';
                indicator.style.zIndex = '100';
                indicator.innerHTML = tapX < screenWidth / 2 ? 
                    '<i class="fas fa-backward"></i> 10' : 
                    '<i class="fas fa-forward"></i> 10';
                
                videoPlayer.appendChild(indicator);
                
                // Удаляем индикатор через 1 секунду
                setTimeout(() => {
                    videoPlayer.removeChild(indicator);
                }, 1000);
            }
            
            lastTapTime = currentTime;
            lastTapX = tapX;
        });
    }
    
    // Инициализация плеера
    initPlayer();
});


// Дополнительные функции для мобильной поддержки и оптимизации

// Улучшенная обработка мобильных событий
function enhanceMobileSupport() {
    // Определяем, является ли устройство мобильным
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Добавляем класс для мобильных устройств
        videoPlayer.classList.add('mobile-device');
        
        // Создаем индикаторы для мобильных устройств
        createMobileIndicators();
        
        // Улучшенная обработка двойного нажатия
        enhanceDoubleTapDetection();
        
        // Обработка изменения ориентации устройства
        handleOrientationChange();
        
        // Оптимизация автоскрытия элементов управления
        optimizeControlsAutoHide();
    }
}

// Создание индикаторов для мобильных устройств
function createMobileIndicators() {
    // Индикатор буферизации
    const bufferingIndicator = document.createElement('div');
    bufferingIndicator.className = 'buffering-indicator';
    videoPlayer.appendChild(bufferingIndicator);
    
    // Индикатор громкости
    const volumeIndicator = document.createElement('div');
    volumeIndicator.className = 'volume-indicator';
    volumeIndicator.innerHTML = `
        <i class="fas fa-volume-up"></i>
        <div class="volume-level">
            <div class="volume-level-filled" style="width: 100%;"></div>
        </div>
    `;
    videoPlayer.appendChild(volumeIndicator);
    
    // Обработка событий буферизации
    video.addEventListener('waiting', () => {
        videoPlayer.classList.add('buffering');
    });
    
    video.addEventListener('playing', () => {
        videoPlayer.classList.remove('buffering');
    });
    
    video.addEventListener('canplay', () => {
        videoPlayer.classList.remove('buffering');
    });
}

// Улучшенная обработка двойного нажатия
function enhanceDoubleTapDetection() {
    // Переменные для отслеживания касаний
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTapTime = 0;
    let tapTimeout;
    
    // Обработка начала касания
    videoPlayer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        // Показываем элементы управления
        document.querySelector('.top-panel').style.opacity = '1';
        document.querySelector('.bottom-panel').style.opacity = '1';
        document.querySelector('.episode-navigation').style.opacity = '1';
        
        // Запускаем таймер скрытия
        startHideControlsTimer();
    });
    
    // Обработка окончания касания
    videoPlayer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchTime = new Date().getTime();
        const touchDistance = Math.sqrt(
            Math.pow(touchEndX - touchStartX, 2) + 
            Math.pow(touchEndY - touchStartY, 2)
        );
        
        // Если движение было минимальным (не свайп)
        if (touchDistance < 10) {
            // Проверяем, было ли это двойным нажатием
            if (touchTime - lastTapTime < 300) {
                clearTimeout(tapTimeout);
                
                // Определяем, на какой стороне экрана было нажатие
                const screenWidth = window.innerWidth;
                if (touchEndX < screenWidth / 2) {
                    // Левая сторона - перемотка назад на 10 секунд
                    rewindVideo(-10, touchEndX, touchEndY);
                } else {
                    // Правая сторона - перемотка вперед на 10 секунд
                    rewindVideo(10, touchEndX, touchEndY);
                }
            } else {
                // Одиночное нажатие - ставим таймер для проверки
                tapTimeout = setTimeout(() => {
                    // Одиночное нажатие - воспроизведение/пауза
                    togglePlay();
                }, 300);
            }
            
            lastTapTime = touchTime;
        }
    });
}

// Функция перемотки видео с индикатором
function rewindVideo(seconds, x, y) {
    // Перематываем видео
    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    video.currentTime = newTime;
    
    // Создаем и показываем индикатор перемотки
    const indicator = document.createElement('div');
    indicator.className = 'rewind-indicator';
    indicator.style.left = `${x}px`;
    indicator.style.top = `${y}px`;
    
    // Устанавливаем содержимое индикатора
    if (seconds < 0) {
        indicator.innerHTML = `<i class="fas fa-backward"></i> ${Math.abs(seconds)}`;
    } else {
        indicator.innerHTML = `<i class="fas fa-forward"></i> ${seconds}`;
    }
    
    // Добавляем индикатор в плеер
    videoPlayer.appendChild(indicator);
    
    // Удаляем индикатор через 1 секунду
    setTimeout(() => {
        if (videoPlayer.contains(indicator)) {
            videoPlayer.removeChild(indicator);
        }
    }, 1000);
}

// Обработка изменения ориентации устройства
function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        // Небольшая задержка для корректного обновления размеров
        setTimeout(() => {
            // Адаптируем размеры элементов под новую ориентацию
            adjustElementsForOrientation();
        }, 300);
    });
    
    // Также вызываем при загрузке
    adjustElementsForOrientation();
}

// Адаптация элементов под ориентацию устройства
function adjustElementsForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
        // Ландшафтная ориентация
        videoPlayer.classList.add('landscape');
        videoPlayer.classList.remove('portrait');
        
        // Оптимизируем размер панели эпизодов
        if (window.innerHeight < 500) {
            episodesPanel.style.height = '80%';
        } else {
            episodesPanel.style.height = '50%';
        }
    } else {
        // Портретная ориентация
        videoPlayer.classList.add('portrait');
        videoPlayer.classList.remove('landscape');
        
        // Возвращаем стандартный размер панели эпизодов
        episodesPanel.style.height = '50%';
    }
}

// Оптимизация автоскрытия элементов управления
function optimizeControlsAutoHide() {
    // Переменные для отслеживания активности пользователя
    let userActive = true;
    let userActiveTimeout;
    
    // Функция для отметки активности пользователя
    function markUserActive() {
        userActive = true;
        clearTimeout(userActiveTimeout);
        
        // Показываем элементы управления
        document.querySelector('.top-panel').style.opacity = '1';
        document.querySelector('.bottom-panel').style.opacity = '1';
        document.querySelector('.episode-navigation').style.opacity = '1';
        
        // Устанавливаем таймер неактивности
        userActiveTimeout = setTimeout(() => {
            userActive = false;
            
            // Если видео воспроизводится, скрываем элементы управления
            if (isPlaying && !episodesPanel.classList.contains('active')) {
                document.querySelector('.top-panel').style.opacity = '0';
                document.querySelector('.bottom-panel').style.opacity = '0';
                document.querySelector('.episode-navigation').style.opacity = '0';
            }
        }, isPlaying ? 3000 : 10000);
    }
    
    // Отслеживаем движения и касания
    videoPlayer.addEventListener('mousemove', markUserActive);
    videoPlayer.addEventListener('touchstart', markUserActive);
    videoPlayer.addEventListener('touchmove', markUserActive);
    
    // Инициализируем активность пользователя
    markUserActive();
}

// Оптимизация загрузки видео
function optimizeVideoLoading() {
    // Предзагрузка видео
    video.preload = 'auto';
    
    // Обработка ошибок загрузки
    video.addEventListener('error', (e) => {
        console.error('Ошибка загрузки видео:', e);
        
        // Показываем сообщение об ошибке
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="error-text">Ошибка загрузки видео. Пожалуйста, попробуйте позже.</div>
            <div class="error-retry">Повторить</div>
        `;
        
        // Добавляем обработчик для кнопки повтора
        errorMessage.querySelector('.error-retry').addEventListener('click', () => {
            // Перезагружаем видео
            video.load();
            video.play().catch(err => console.error('Ошибка воспроизведения:', err));
            
            // Удаляем сообщение об ошибке
            if (videoPlayer.contains(errorMessage)) {
                videoPlayer.removeChild(errorMessage);
            }
        });
        
        // Добавляем сообщение в плеер
        videoPlayer.appendChild(errorMessage);
    });
    
    // Оптимизация буферизации
    video.addEventListener('progress', () => {
        // Получаем информацию о буферизации
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const duration = video.duration;
            const bufferedPercent = (bufferedEnd / duration) * 100;
            
            // Можно использовать эту информацию для отображения прогресса буферизации
            // console.log(`Буферизовано: ${bufferedPercent.toFixed(2)}%`);
        }
    });
}

// Вызываем функции оптимизации
enhanceMobileSupport();
optimizeVideoLoading();

