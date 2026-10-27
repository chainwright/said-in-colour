#!/bin/sh
# Cuts made from the recorded scenes (no new filming); assemble.py uses scenes/sN_edit.mp4 when present.
# s1, s3: a slow push-in over the last seconds, so the frame doesn't freeze while the line finishes.
# s6: the method, then the navy shot from s3 (safe for both) under "the next time you get dressed...".
set -e
cd "$(dirname "$0")"
push() { # scene, total length, push start
  ffmpeg -v error -y -i scenes/$1.mp4 -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=5,trim=0:$2,setpts=PTS-STARTPTS,fps=30,scale=w='trunc(1920*(1+0.06*clip((t-$3)/($2-$3),0,1))/2)*2':h=-2:eval=frame,crop=1920:1080,setsar=1,format=yuv420p" -c:v libx264 -crf 18 scenes/$1_edit.mp4
}
push s1 17.2 13.0
push s3 16.2 11.4
ffmpeg -v error -y -i scenes/s6.mp4 -i scenes/s3.mp4 -filter_complex "[0:v]trim=0:15.6,setpts=PTS-STARTPTS,fps=30[a];[1:v]trim=11.2:14.8,setpts=(PTS-STARTPTS)*1.25,fps=30,scale=w='trunc(1920*(1+0.06*t/4.5)/2)*2':h=-2:eval=frame,crop=1920:1080,setsar=1[b];[a][b]xfade=transition=fade:duration=0.4:offset=15.2,format=yuv420p" -c:v libx264 -crf 18 scenes/s6_edit.mp4
