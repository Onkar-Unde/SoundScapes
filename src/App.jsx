"use client";

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WhiteNoise from "./pages/WhiteNoise";
import NotFound from "./pages/NotFound";
import PinkNoise from "./pages/PinkNoise";
import Settings from "./pages/Settings";
import BrownNoise from "./pages/BrownNoise";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import Podcasts from "./pages/Podcasts";
import Embed from "./pages/Embed";
import Credits from "./pages/Credits";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarInset,
} from "./components/ui/sidebar";
import { LucideHome } from "lucide-react";
import { Square } from "lucide-react";
import { useIsMobile } from "./components/hooks/use-mobile";
import { Link } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { soundscapes } from "./soundscapes";
import { useState, useEffect, useRef } from "react";
import audioRef from "./audioRef";
import { SkipForward } from "lucide-react";
import { Button } from "./components/ui/button";
import { SkipBack } from "lucide-react";
import { Rewind } from "lucide-react";
import { Play } from "lucide-react";
import { Forward } from "lucide-react";
import { FastForward } from "lucide-react";
import { Pause } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn } from "./components/lib/utils";
import { Shield } from "lucide-react";
import { Notebook } from "lucide-react";
import { Github } from "lucide-react";



function App() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [currentURL, setCurrentURL] = useState(null);
  const pathname = location.pathname;
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTitle, setAudioTitle] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);

  // State for tracking listening preferences
  const [listeningPreferences, setListeningPreferences] = useState({});
  const currentSoundRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentSessionDurationRef = useRef(0);
  const sessionIdRef = useRef(null); // New ref to track unique session IDs

  // Load listening preferences from localStorage on component mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem("listeningPreferences");
      if (savedPreferences) {
        const parsedPrefs = JSON.parse(savedPreferences);

        // Convert any existing data to the new format (totalMinutes + sessionCount)
        const updatedPrefs = {};

        Object.entries(parsedPrefs).forEach(([key, data]) => {
          // If the old format has listeningSessions array, convert to sessionCount
          if (data.listeningSessions) {
            updatedPrefs[key] = {
              totalMinutes: data.totalMinutes || 0,
              sessionCount: data.listeningSessions.length || 0,
            };
          } else {
            // Already in new format or unknown format
            updatedPrefs[key] = {
              totalMinutes: data.totalMinutes || 0,
              sessionCount: data.sessionCount || 0,
            };
          }
        });

        setListeningPreferences(updatedPrefs);
      }
    } catch (error) {
      console.error("Error loading listening preferences:", error);
    }
  }, []);

  // Save listening preferences to localStorage whenever they change
  useEffect(() => {
    try {
      if (Object.keys(listeningPreferences).length > 0) {
        localStorage.setItem(
          "listeningPreferences",
          JSON.stringify(listeningPreferences)
        );

        // Send event to sync listening preferences with Home component
        window.dispatchEvent(
          new CustomEvent("listening-preferences-update", {
            detail: { listeningPreferences },
          })
        );
      }
    } catch (error) {
      console.error("Error saving listening preferences:", error);
    }
  }, [listeningPreferences]);

  useEffect(() => {
    const audio = audioRef.current || document.getElementById("player");
    const handleTitleChange = (passedTitle) => {
      if (!passedTitle) return;
      setAudioTitle(passedTitle);
      currentSoundRef.current = passedTitle.toLowerCase().replace(/\s+/g, "-");
    };

    if (audio) {
      // Initial state
      setAudioPlaying(!audio.paused);
      handleTitleChange(audio.title);

      // Event listeners for play/pause state
      const handlePlay = () => {
        setAudioPlaying(true);

        // Generate a new session ID if we don't already have one
        // This will help track when we're continuing the same session vs starting a new one
        if (!sessionIdRef.current) {
          sessionIdRef.current = Date.now();
        }

        // If this is a fresh start (not a pause/resume), reset the start time and session duration
        if (!startTimeRef.current) {
          startTimeRef.current = new Date();
          currentSessionDurationRef.current = 0;
        }

        // Start timer to track listening time
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          if (currentSoundRef.current) {
            const soundKey = currentSoundRef.current;
            currentSessionDurationRef.current += 1 / 60; // Track session duration in minutes

            // Update listening preferences - only update total minutes while playing
            // We'll record the session when the sound changes or stops
            setListeningPreferences((prev) => {
              const soundData = prev[soundKey] || {
                totalMinutes: 0,
                sessionCount: 0,
              };

              // Calculate the current session duration
              const now = new Date();
              const currentSessionDuration = startTimeRef.current
                ? parseFloat(
                    ((now - startTimeRef.current) / (1000 * 60)).toFixed(2)
                  )
                : 0;

              // Store the current duration for later use when the session ends
              currentSessionDurationRef.current = currentSessionDuration;

              // Only update the total minutes, don't modify session count yet
              return {
                ...prev,
                [soundKey]: {
                  ...soundData,
                  totalMinutes: parseFloat(
                    (soundData.totalMinutes + 1 / 60).toFixed(2)
                  ), // Add 1/60 minutes (1 second)
                },
              };
            });
          }
        }, 1000); // Update every second
      };

      const handlePause = () => {
        setAudioPlaying(false);
        // Stop the timer when audio is paused
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Update total listening time when audio is paused, but don't add a new session
        if (currentSoundRef.current && startTimeRef.current) {
          const soundKey = currentSoundRef.current;
          const endTime = new Date();
          const listenedMinutes = parseFloat(
            ((endTime - startTimeRef.current) / (1000 * 60)).toFixed(2)
          );

          // Only update the total minutes, don't add a new session entry
          setListeningPreferences((prev) => {
            const soundData = prev[soundKey] || {
              totalMinutes: 0,
              sessionCount: 0,
            };
            return {
              ...prev,
              [soundKey]: {
                ...soundData,
                totalMinutes: parseFloat(
                  (soundData.totalMinutes + listenedMinutes).toFixed(2)
                ),
                // Keep the session count unchanged during pauses
              },
            };
          });

          // We don't reset currentSessionDurationRef or startTimeRef here
          // This allows the session to continue if play is pressed again
        }
      };

      // Event listeners for loading state
      const handleLoadStart = () => setAudioLoading(true);
      const handleCanPlay = () => setAudioLoading(false);
      const handleError = () => setAudioLoading(false);

      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("loadstart", handleLoadStart);
      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("error", handleError);

      // Listen only for title attribute changes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.attributeName === "title") {
            let mutatedTitle = mutation.target.getAttribute("title");
            handleTitleChange(mutatedTitle);
          }
        }
      });

      observer.observe(audio, {
        attributes: true,
        attributeFilter: ["title"],
      });

      return () => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("loadstart", handleLoadStart);
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("error", handleError);
        observer.disconnect();

        // Clean up timer on component unmount
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, []);

  // Add state to track if we're in a playlist
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

  // Create a global function to increment session count when a button is clicked
  useEffect(() => {
    // Function to increment session count for a soundscape when button is clicked
    window.incrementSessionCount = (soundKey) => {
      if (!soundKey) return;

      setListeningPreferences((prev) => {
        const soundData = prev[soundKey] || {
          totalMinutes: 0,
          sessionCount: 0,
        };

        return {
          ...prev,
          [soundKey]: {
            totalMinutes: soundData.totalMinutes,
            sessionCount: soundData.sessionCount + 1, // Increment immediately on button click
          },
        };
      });

      console.log(`Button clicked: session count incremented for ${soundKey}`);
    };

    // Clean up the global function when component unmounts
    return () => {
      delete window.incrementSessionCount;
    };
  }, []);

  // Listen for custom events from Home component to sync playlist state
  useEffect(() => {
    const handlePlaylistChange = (event) => {
      setCurrentPlaylist(event.detail.playlist);
      setCurrentPlaylistIndex(event.detail.index);
    };

    const handlePlaylistStop = () => {
      setCurrentPlaylist(null);
      setCurrentPlaylistIndex(0);
    };

    // Handle the smart-mix-transition event to update listening time only
    // Session count increments are now handled directly in Home.jsx when sounds are selected
    const handleSmartMixTransition = (event) => {
      if (currentSoundRef.current && startTimeRef.current) {
        const soundKey = currentSoundRef.current;
        const endTime = new Date();
        const listenedMinutes = parseFloat(
          ((endTime - startTimeRef.current) / (1000 * 60)).toFixed(2)
        );

        // Only update total time - session count is incremented when buttons are clicked
        setListeningPreferences((prev) => {
          const soundData = prev[soundKey] || {
            totalMinutes: 0,
            sessionCount: 0,
          };

          return {
            ...prev,
            [soundKey]: {
              totalMinutes: parseFloat(
                (soundData.totalMinutes + listenedMinutes).toFixed(2)
              ),
              // Don't increment session count here - it's done when a button is clicked
              sessionCount: soundData.sessionCount,
            },
          };
        });

        console.log(`Smart Mix transition: updated time for ${soundKey}`);

        // Reset for the next sound
        startTimeRef.current = new Date();
        currentSessionDurationRef.current = 0;
      }
    };

    window.addEventListener("playlist-change", handlePlaylistChange);
    window.addEventListener("playlist-stop", handlePlaylistStop);
    window.addEventListener("smart-mix-transition", handleSmartMixTransition);

    return () => {
      window.removeEventListener("playlist-change", handlePlaylistChange);
      window.removeEventListener("playlist-stop", handlePlaylistStop);
      window.removeEventListener(
        "smart-mix-transition",
        handleSmartMixTransition
      );
    };
  }, []);

  const playSound = (url, volume, name, image, index) => {
    const audio = audioRef.current || document.getElementById("player");

    // Track the previous sound's total time only
    if (
      audioPlaying &&
      currentSoundRef.current &&
      startTimeRef.current &&
      audio.src !== url
    ) {
      const soundKey = currentSoundRef.current;
      const endTime = new Date();
      const listenedMinutes = parseFloat(
        ((endTime - startTimeRef.current) / (1000 * 60)).toFixed(2)
      );

      // Only update total time, session count is handled on button click in Home.jsx
      setListeningPreferences((prev) => {
        const soundData = prev[soundKey] || {
          totalMinutes: 0,
          sessionCount: 0,
        };

        return {
          ...prev,
          [soundKey]: {
            totalMinutes: parseFloat(
              (soundData.totalMinutes + listenedMinutes).toFixed(2)
            ),
            sessionCount: soundData.sessionCount, // Not incrementing session count here
          },
        };
      });

      // Reset session tracking for the new sound
      startTimeRef.current = new Date();
      currentSessionDurationRef.current = 0;
    }

    if (audio.src === url && audioPlaying) {
      audio.pause();
      return;
    } else {
      // Set loading state to true when starting to load a new audio
      setAudioLoading(true);

      // Set up new audio source
      audio.src = url;
      audio.title = name;
      audio.setAttribute("image", image);
      audio.setAttribute("index", index);
      setCurrentURL(url);

      // Note: Session count is now incremented in Home.jsx when the button is clicked
      // We no longer increment session count here

      // Find the corresponding soundscape to get the volume
      const soundscape = soundscapes.find((s) => s.url === url);
      if (soundscape) {
        // Set volume directly from the soundscape
        audio.volume = soundscape.volume || 1.0;
      } else {
        // Fallback volume
        audio.volume = volume || 1.0;
      }

      // Play the audio
      audio.play();
    }
  };

  // Function to navigate to next playlist item
  const playNextPlaylistItem = () => {
    if (!currentPlaylist || !currentPlaylist.items) return false;

    const nextIndex = (currentPlaylistIndex + 1) % currentPlaylist.items.length;
    // Dispatch event to notify Home component to play next item
    window.dispatchEvent(
      new CustomEvent("playlist-next", {
        detail: { index: nextIndex },
      })
    );
    return true;
  };

  // Function to navigate to previous playlist item
  const playPreviousPlaylistItem = () => {
    if (!currentPlaylist || !currentPlaylist.items) return false;

    const prevIndex =
      currentPlaylistIndex === 0
        ? currentPlaylist.items.length - 1
        : currentPlaylistIndex - 1;
    // Dispatch event to notify Home component to play previous item
    window.dispatchEvent(
      new CustomEvent("playlist-previous", {
        detail: { index: prevIndex },
      })
    );
    return true;
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <Link
            to="/"
            onMouseDown={(e) => {
              e.preventDefault();
              e.target.click();
            }}
            className="flex items-center gap-1.5 p-2 text-gray-200 hover:text-white transition-colors tracking-[-0.1px] font-medium text-sm"
          >
            {/*prettier-ignore*/}
           {/* / <NoisefillSvg /> */}
           <img
           src="https://orrery-media.s3.amazonaws.com/attr/2023-02/Sounds_of_Nature.png"image path
           alt="Logo"
          className="w-6 h-6 object-contain"
    />
            SoundScapes
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={"home"}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/"}
                    className="text-gray-300 hover:text-white"
                  >
                    <NavLink
                      to="/"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.target.click();
                      }}
                    >
                      <LucideHome />
                      <span>Home</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400">
             Sounds
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={"white-noise"}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/white-noise"}
                    className="text-gray-300 hover:text-white"
                  >
                    <NavLink
                      to="/white-noise"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.target.click();
                      }}
                    >
                      <Square fill="currentColor" />
                      <span>White Sound</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem key={"pink-noise"}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/pink-noise"}
                    className="text-gray-300 hover:text-white"
                  >
                    <NavLink
                      to="/pink-noise"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.target.click();
                      }}
                    >
                      <Square fill="pink" />
                      <span>Pink Sound</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem key={"brown-noise"}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/brown-noise"}
                    className="text-gray-300 hover:text-white"
                  >
                    <NavLink
                      to="/brown-noise"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.target.click();
                      }}
                    >
                      <Square fill="brown" />
                      <span>Brown Sound</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400">
              About
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={"privacy"}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/privacy"}
                    className="text-gray-300 hover:text-white"
                  >
                    <NavLink
                      to="/privacy"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.target.click();
                      }}
                    >
                      <Shield />
                      <span>Privacy</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem key={"credits"}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/credits"}
                    className="text-gray-300 hover:text-white"
                  >
                    <NavLink
                      to="/credits"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.target.click();
                      }}
                    >
                      <Notebook />
                      <span>Credits</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem key={"github"}>
                  <a
                    href="https://github.com/Onkar-Unde/noisefill-main"
                    rel="noopener noreferrer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.target.click();
                    }}
                  >
                    <SidebarMenuButton className="text-gray-300 hover:text-white">
                      <Github className="size-4" />
                      <span>GitHub</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-[#101012] !border max-h-[calc(100vh-16px)] flex-col">
        <SiteHeader />
        <div className="overflow-y-auto flex-1">
          <div className="relative z-10 overflow-y-auto p-4">
            <Routes>
              <Route
                path="/"
                element={
                  <Home currentURL={currentURL} setCurrentURL={setCurrentURL} />
                }
              />
              <Route path="/embed" element={<Embed />} />
              <Route path="/white-noise" element={<WhiteNoise />} />
              <Route path="/pink-noise" element={<PinkNoise />} />
              <Route path="/brown-noise" element={<BrownNoise />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        <div
          className={cn(
            "flex px-4 py-2 justify-center gap-4 items-center",
            "rounded-2xl shadow-lg border absolute",
            "bg-[#101012]/40 backdrop-blur-xl bottom-4 z-10 w-fit",
            "left-1/2 -translate-x-1/2 h-[58px]",
            {
              "!hidden": currentURL == null || currentURL === "",
            }
          )}
        >
          {audioLoading ? (
            <div className="center flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
              <p className="text-lg font-medium select-none">
                {audioTitle || "Loading audio..."}
              </p>
            </div>
          ) : (
            <>
              <div className="left">
                <Button
                  onClick={() => {
                    const audio =
                      audioRef.current || document.getElementById("player");
                    if (!audio) return;
                    if (audio.paused) {
                      audio.play();
                    } else {
                      audio.pause();
                    }
                  }}
                  aria-label="Play/Pause"
                  variant="ghost"
                  className="px-2"
                >
                  {audioPlaying ? (
                    <Pause fill="currentColor" />
                  ) : (
                    <Play fill="currentColor" />
                  )}
                </Button>
              </div>
              <div className="center">
                <p className="text-lg w-fit whitespace-nowrap font-medium select-none">
                  {audioTitle}
                </p>
              </div>
              <div className="right flex justify-center items-center">
                <Button
                  onClick={() => {
                    // Check if we're in a playlist first
                    if (!playPreviousPlaylistItem()) {
                      // If not in a playlist or playlist navigation failed, use default behavior
                      const audio =
                        audioRef.current || document.getElementById("player");
                      if (!audio) return;
                      const index = parseInt(audio.getAttribute("index"));
                      if (index > 0) {
                        playSound(
                          soundscapes[index - 1].url,
                          soundscapes[index - 1].volume,
                          soundscapes[index - 1].name,
                          soundscapes[index - 1].image,
                          soundscapes[index - 1].index
                        );
                      } else {
                        playSound(
                          soundscapes[soundscapes.length - 1].url,
                          soundscapes[soundscapes.length - 1].volume,
                          soundscapes[soundscapes.length - 1].name,
                          soundscapes[soundscapes.length - 1].image,
                          soundscapes[soundscapes.length - 1].index
                        );
                      }
                    }
                  }}
                  aria-label="Previous track"
                  variant="ghost"
                  className="px-2"
                >
                  <Rewind fill="currentColor" />
                </Button>
                <Button
                  onClick={() => {
                    // Check if we're in a playlist first
                    if (!playNextPlaylistItem()) {
                      // If not in a playlist or playlist navigation failed, use default behavior
                      const audio =
                        audioRef.current || document.getElementById("player");
                      if (!audio) return;
                      const index = parseInt(audio.getAttribute("index"));
                      if (index < soundscapes.length - 1) {
                        playSound(
                          soundscapes[index + 1].url,
                          soundscapes[index + 1].volume,
                          soundscapes[index + 1].name,
                          soundscapes[index + 1].image,
                          soundscapes[index + 1].index
                        );
                      } else {
                        playSound(
                          soundscapes[0].url,
                          soundscapes[0].volume,
                          soundscapes[0].name,
                          soundscapes[0].image,
                          soundscapes[0].index
                        );
                      }
                    }
                  }}
                  aria-label="Next track"
                  variant="ghost"
                  className="px-2"
                >
                  <FastForward fill="currentColor" />
                </Button>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
