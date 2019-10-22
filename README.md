# ADL Music Annotation Tool

This repository contains the source code for the music annotation tool used to annotate sentiment of MIDI pieces in the [VGMIDI dataset](https://github.com/lucasnfe/vgmidi).

## Data Annotation
The data annotation process is composed of five steps, each one being a single web-page:  

> 1. Participants are introduced to the annotation task with a short description explaining the goal of the task and how long it should take in average.

> 2. They are presented to the definitions of valence and arousal. In the same page, they are asked to play two short pieces and indicate whether arousal and valence are increasing or decreasing. Moreover, we ask the annotators to write two to three sentences describing the short pieces they listened to.

> 3. A video tutorial was made available to the annotators explaining how to use the annotation tool.

> 4. Annotators are exposed to the main annotation page. This main page has two phases: *calibration* and *annotation*.

 >> i. Calibration phase: annotators listen to the first 15 seconds of the piece in order to get used to it and to define the   starting point of the annotation circle.  
  
 >> ii. Annotation phase: annotators listen to the piece from beginning to end and label it using the annotation circle, which starts at the point defined during the calibration phase.

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
