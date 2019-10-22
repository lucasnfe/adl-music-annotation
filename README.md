# ADL Music Annotation Tool

This repository contains the source code for the Augmented Design Lab (ADL) Music Annotation Tool used to annotate sentiment of MIDI pieces in the [VGMIDI dataset](https://github.com/lucasnfe/vgmidi).

## Data Annotation
The data annotation process is composed of five steps, each one being a single web-page:  

<ol>
 
 <li>
    <img align="left" src="/img/screenshots/screenshot1.png" width="280" />
    <p> Participants are introduced to the annotation task with a short description explaining the goal of the task and how 
     long it should take in average.</p>
     </br></br></br></br></br></br></br></br></br>
 </li>

 <li><img align="left" src="/img/screenshots/screenshot2.png" width="280" /> 
     <p>They are presented to the definitions of valence and arousal. In the same page, they are asked to play two short 
      pieces and indicate whether arousal and valence are increasing or decreasing. Moreover, we ask the annotators to write 
      two to three sentences describing the short pieces they listened to.</p>
      </br></br></br></br></br></br></br></br>
 </li>
  
 <li><img align="left" src="/img/screenshots/screenshot3.png" width="280" />
     <p>A video tutorial was made available to the annotators explaining how to use the annotation tool.</p>
     </br></br></br></br></br></br></br></br></br></br>
 </li>

 <li><img align="left" src="/img/screenshots/screenshot4.png" width="280" />
     <p>Calibration phase: annotators listen to the first 15 seconds of the piece in order to get used to it and to define 
           the starting point of the annotation circle.</p>
     </br></br></br></br></br></br></br></br></br>
 </li>
 
  
 <li><img align="left" src="/img/screenshots/screenshot6.png" width="280" />
     <p>Annotation phase: annotators listen to the piece from beginning to end and label it using the annotation circle, 
        which starts at the point defined during the calibration phase.</p>
     </br></br></br></br></br></br></br></br></br>
 </li>
</ol>
 



## Citing this Tool
This tool was presented in [this paper](http://www.lucasnferreira.com/papers/2019/ismir-learning.pdf), so if you use it, 
please cite:

```
@article{ferreira_ismir_2019,
  title={Learning to Generate Music with Sentiment},
  author={Ferreira, Lucas N. and Whitehead, Jim},
  booktitle = {Proceedings of the Conference of the International Society for Music Information Retrieval},
  series = {ISMIR'19},
  year={2019},
}
```
