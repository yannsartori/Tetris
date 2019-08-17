# Tetris
Play Tetris. Created with JavaScript and Canvas
See it in action at https://www.cs.mcgill.ca/~ysarto/projectsDir/graph
Disclaimer I have to put:
Tetris © 1985~2019 Tetris Holding.
Tetris logos, Tetris theme song and Tetriminos are trademarks of Tetris Holding.
The Tetris trade dress is owned by Tetris Holding.
Licensed to The Tetris Company.
Tetris Game Design by Alexey Pajitnov.
Tetris Logo Design by Roger Dean.
All Rights Reserved.
## Goals
Over the summer, my sisters left for home earlier than I did. With them, the took the Nintendo Switch with which I would play Tetris 99, and as such, was suffering from a Tetris withdrawl. As such, I played some versions online, but I still had a couple of weeks left in my summer so I decided to make this. The fact that my previous attempt a while back was utter trash only further motivated me. The goals for this project were as follows: 
- creating a Tetris with SRS rotation, modern scoring expectations (T-Spins, perfect clear, combos, et), virtually everything customiizable (controls, style, timings), and press-and-hold on rotations and HD (a feature not found on the versions I played online, surprisingly)
- creating a good pause menu using just `canvas` and HTML event listeners attached on said `canvas`
- using cookies to store user-defined parameters
- better graphics
## On what can be improved
I'm actually very, very satisfied with this project. No major bugs, and a lot of features I wish to have are included. However, as with any project, improvements can certainly be made.
- adding sound effects and music
- adding modes (primarily 40-line sprint because it is my favourite :) )
- using setInterval and changing everything to be in milliseconds instead of frames. This is tentative, because I think it allow for more flexibility in speed and prevent stuff from being tied to requestAnimationFrame frame rate (though most people use modern browsers at 60 hz) but given how the speed would be faster than the refresh rate, I don't know what effect it would have.
