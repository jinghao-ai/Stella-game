

<h3>**Stella Team's Suspense Crime Investigation Interactive Game**</h3>


<img width="600" height="300" alt="图片1" src="https://github.com/user-attachments/assets/97ecb4cf-9c52-4344-9f01-bf8fedcd798e" />





Project Plan

By:Stella Team

Members and Roles:


• Zhang Jinghao:Project Planning,Programming,Background Music Composition

• Jin Yikun:Programming

• Dong Zequan:Programming,Version Control

• Miao Xintian:Artwork

• Hu Yifan:Architect

• Chen Yiming:Testing


Table of Contents


• [Project Overview](#1-project-overview)

• [1.1 Project Name](#11-project-name)

• [1.2 Project Type](#12-project-type)

• [1.3 Project Origin and Inspiration](#13-project-origin-and-inspiration)

• [Project Content Design](#2-project-content-design)

• [2.1 Plot Design](#21-plot-design)

• [2.1.1 Background](#211-background)

• [2.1.2 The Black Peter Case](#212-the-black-peter-case)

• [2.1.3 The Disappearing Train Case](#213-the-disappearing-train-case)

• [2.1.4 Ending Design](#214-ending-design)

• [2.2 Level Design](#22-level-design)

• [2.2.1 Initial Level(Soft Tutorial)](#221-initial-level-soft-tutorial)

• [2.2.2 Subsequent Level Directions](#222-subsequent-level-directions)

• [2.2.3 Diverse Puzzle Elements](#223-diverse-puzzle-elements)

• [2.3 Interaction Design](#23-interaction-design)

• [2.3.1 Dialogue System](#231-dialogue-system)

• [2.3.2 Interactive Option Design](#232-interactive-option-design)

• [Project Technology](#3-project-technology)

• [3.1 Coding Techniques and Tools](#31-coding-techniques-and-tools)

• [3.2 Page Structure Design](#32-page-structure-design)

• [3.3 Site Map Design](#33-site-map-design)

• [Work Schedule](#4-work-schedule)

• [4.1 Time Schedule(Gantt Chart)](#41-time-schedule-gantt-chart)

• [4.2 Division of Labor](#42-division-of-labor)

• [Design Documents](#5-design-documents)

• [5.1 Site Map](#51-site-map)

• [5.2 Game Wireframes](#52-game-wireframes)

• [5.3 Design Specifications](#53-design-specifications)

• [Project Objectives and Achievements](#6-project-objectives-and-achievements)

• [6.1 Project Objectives](#61-project-objectives)

• [6.2 Learning Outcomes](#62-learning-outcomes)

• [Detailed Technical Implementation Details](#7-detailed-technical-implementation-details)

• [7.1 Code Structure](#71-code-structure)

• [7.2 Technical Challenges](#72-technical-challenges)

• [7.3 Interface Design Details](#73-interface-design-details)

• [Project Summary and Reflection](#8-project-summary-and-reflection)

• [8.1 Project Summary](#81-project-summary)

• [8.2 Reflection and Improvement](#82-reflection-and-improvement)


---



1.Project Overview


1.1 Project Name

Sherlock Holmes:Crimes and Punishment Simplified Edition

The Stella team adapts the classic detective genre into a 2D text-based interactive game,recreating the mystery-solving experience ofThe Black Peter CaseandThe Disappearing Train Caseon a web platform.


1.2 Project Type

Mystery Investigation Interactive Game

A mystery investigation interactive game,presented in a web-based format combining text interaction with simple 2D illustrations.The core gameplay involves reading case details,selecting reasoning paths,collecting clues,and ultimately solving the mystery and making judgments.


1.3 Project Origin and Inspiration


<img width="559" height="287" alt="图片2" src="https://github.com/user-attachments/assets/0d9d4ff0-a133-4e46-95d3-6e7f73bd5ba5" />



The inspiration primarily comes fromSherlock Holmes:Crimes and Punishmentsby Frogwares.We have selected two representative cases,The Black Peter CaseandThe Disappearing Train Case,to present in a text-based interactive manner.This project is for learning and demonstration purposes only,and the plot and characters belong to the original copyright holders.


---



2.Project Content Design


2.1 Plot Design


2.1.1 Background

The game is set in Victorian-era London.Players take on the role of Sherlock Holmes,working with Dr.Watson to investigate bizarre cases.


2.1.2 The Black Peter Case


<img width="575" height="362" alt="图片3" src="https://github.com/user-attachments/assets/064aa46f-67de-4f6e-b9a2-8a95819a869b" />



Black Peter is a retired whaling captain with a violent temper,living in a country cottage.One day,he is found dead in his study,with a whaling harpoon embedded in his back.Players need to investigate the crime scene,collect clues,and converse with suspects to deduce the truth.


2.1.3 The Disappearing Train Case


<img width="610" height="481" alt="图片4" src="https://github.com/user-attachments/assets/12d13d39-cc37-4986-bd37-2fd1ca285f22" />



In this eerie case,a train vanishes en route.Players must visit railway companies,stations,and surrounding villages to find tracks of clues and uncover the conspiracy behind it.The case involves complex motives,testing players'logical reasoning and attention to detail.


2.1.4 Ending Design


<img width="812" height="376" alt="图片5" src="https://github.com/user-attachments/assets/fde5acbf-f659-4dff-923d-2b0cb49842e5" />



Depending on the choices made by players during the investigation and the clues collected,different endings may be triggered:


• Correctly deducing the murderer and motive,leading to a successful case resolution.

• Insufficient evidence,allowing the culprit to escape justice.

• Incorrect reasoning by the player,resulting in a miscarriage of justice.


2.2 Level Design


2.2.1 Initial Level(Soft Tutorial)

The first level begins with The Black Peter Case,serving as a tutorial to help players become familiar with the investigation process and interaction methods.


2.2.2 Subsequent Level Directions

After completing The Black Peter Case,players will unlock The Disappearing Train Case,which features a more complex plot,more clues,and increased difficulty in reasoning.


2.2.3 Diverse Puzzle Elements


<img width="616" height="426" alt="图片6" src="https://github.com/user-attachments/assets/108237a5-a0a2-4fa6-8d14-c6117c0cd206" />



Including logical reasoning in dialogues,clue puzzles,and timeline reconstruction to maintain playability.


2.3 Interaction Design


2.3.1 Dialogue System


<img width="616" height="426" alt="图片6" src="https://github.com/user-attachments/assets/e519dd08-2495-404e-a403-0431907fcdaa" />


Dialogue is presented in a dialogue box format,accompanied by character portraits and emotional changes.


2.3.2 Interactive Option Design

Key nodes provide options,with different choices affecting the plot direction and case outcome.


---



3.Project Technology


3.1 Coding Techniques and Tools


<img width="960" height="303" alt="图片7" src="https://github.com/user-attachments/assets/6cd983aa-9e19-4d93-aff0-92c7304e15c2" />



Implemented usingHTML5+CSS3+JavaScript.Version control is handled withGit,and the IDE used isVS Code.


3.2 Page Structure Design

Includes login/registration,main menu,case investigation interface,achievement system,etc.


3.3 Site Map Design

The main menu serves as the central hub,connecting the game plot,achievements,and settings interface.


---



4.Work Schedule


4.1 Time Schedule(Gantt Chart)


• Weeks 1-2:Requirements Analysis and Division of Labor

• Weeks 3-4:Plot and Art Design

• Weeks 5-7:Front-end Development

• Weeks 8-9:Level Implementation

• Week 10:Testing and Optimization

• Week 11:Pre-release and Documentation

• Week 12:Defense and Presentation


4.2 Division of Labor


• Zhang Jinghao:Planning,Programming

• Jin Yikun:Programming

• Dong Zequan:Programming,Version Control

• Miao Xintian:Artwork

• Hu Yifan:Architect

• Chen Yiming:Testing


---



5.Design Documents


5.1 Site Map




• Login→Main Menu→Cases→Achievements/Settings


5.2 Game Wireframes





• Login Interface

• Main Menu

• Case Investigation Interface

• Achievements Page


5.3 Design Specifications


• Color Scheme:Dark blue,black,and red to create a suspenseful atmosphere.

• Typography:Combination of serif and sans-serif fonts for readability.

• Illustrations:Semi-realistic style.

• Layout:Clean and aligned,with clear information zoning.


---



6.Project Objectives and Achievements


6.1 Project Objectives


• Master Development Skills:Proficiency in HTML5,CSS3,and JavaScript.

• Enhance Team Collaboration:Improve project management and teamwork.

• Learn Game Design:Understand the design and development process of mystery investigation games.


6.2 Learning Outcomes


• Individual Development:Each team member will be able to independently develop a small web game by the end of the project.

• Improved Communication:Enhanced communication and collaboration skills among team members.

• User Experience:A deeper understanding of game design principles and the importance of user experience.


---



7.Detailed Technical Implementation Details


7.1 Code Structure


• Modular Design:The game is divided into multiple modules(e.g.,login,main menu,case investigation)with independent functions and interfaces.

• Code Comments:Detailed comments are included to facilitate understanding and maintenance by team members.


7.2 Technical Challenges


• Interaction Design:Ensuring a good user experience with the dialogue system and interactive options.

• Performance Optimization:Optimizing page load times and response speed to ensure smooth gameplay.


7.3 Interface Design Details


• Color Scheme:Using dark blue,black,and red as the main colors to create a suspenseful atmosphere.

• Typography:Combining serif and sans-serif fonts to enhance readability.

• Icon Design:Simple and clear icons to enhance the intuitiveness of the interface.


---



8.Project Summary and Reflection


8.1 Project Summary


• Successful Experiences:Summarize the successful practices and experiences during the project.

• Encountered Issues:Document the problems encountered and their solutions.


8.2 Reflection and Improvement


• Technical Improvements:Propose directions for technical improvements in future projects.

• Team Collaboration Improvements:Summarize issues in team collaboration and suggest improvements.


---


Note:As this is the initial version,there are no in-game images or content displayed.These will be added as the project progresses.


---

