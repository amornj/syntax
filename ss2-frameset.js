/******************************************************
 * Syntax Score Calculator Version 2.0                *
 *                                                    *
 * Orginal code (version 1.0): ISM (2005)             *
 * Adaptions    (version 2.0): Luc Strijbosch (2009)  *
 * Adaptions    (version 2.2): MVG Creative (2016)    *
 ******************************************************/

/*
 * Version 2.0: Changes to this file.
 *
 * - Reloading a lesion is performed by filling out the
 *   complete form based on the saved values.
 *
 * - Deletion involves a shift back of all lesions that
 *   are present 'after' the lesion marked for deletion
 *
 * - Logic for separate question 12 has been added.
 *
 * - Variables that were global in the form.js context
 *   are moved to this file and saved per lesion to
 *   ensure correct reload of form.js
 *
 * - Some minor score changes
 *
 */

var myDefaultArrayLength=12;

// this variable toggles frame(less) layout
var FRAME_LAYOUT = true;

// array that is set to true if lesion form is completed
var meCompletedLesions = new Array(myDefaultArrayLength);

// temporary array used for question 12 that will contain
// all segments selected in all filled out lesions to
// correctly show the diffuse segment table
var meAllSegmentsMerged = new Array(25);


/** The following variables were previously initialized on
    the loading of form.js. However since we are RELOAD
    a form (using form.js) we need these values to be kept
    in memory.

    The array are the memory, the values afterwards are
    set on form load, so the form retrieves the correct values

    This is needed because form.js does not 'know' what
    lesion it is. (essentially stateless).
**/
var formVarBlnQ12Enabled = new Array(myDefaultArrayLength);
var formVarBlnSegmentVisualizedVisual = new Array(myDefaultArrayLength);
var formVarBlnSkip5 = new Array(myDefaultArrayLength);
var formVarBlnSkip6 = new Array(myDefaultArrayLength);
var formVarBlnSkip6by5 = new Array(myDefaultArrayLength);
var formVarBlnSkip7 = new Array(myDefaultArrayLength);
var formVarIDSegmentTableFirstVisible = new Array(myDefaultArrayLength);
var formVarIDSegmentTableLastVisible = new Array(myDefaultArrayLength);
var formVarIDProxSegmentFirstVisible = new Array(myDefaultArrayLength);
var formVarIDProxSegmentLastVisible = new Array(myDefaultArrayLength);
var formVarBlnSaved = new Array(myDefaultArrayLength);
var formVarBlnSegmentTableContainsElements = new Array(myDefaultArrayLength);
var formVarDiffuseDiseaseScore = new Array(myDefaultArrayLength);


/** This function fethces frame frameId in case of a frame
    layout. In case a div layout is used it returns the
    handle to the requested DIV 'frame'.
 **/
function getFrame( frameId ) {
    if( FRAME_LAYOUT ) {
	return window.frames[frameId];
    }
    else {
	alert("Div layout not yet implemented!");
	return;
    }
}

/** Abbreviated syntax for document.getElementById(forId)
 **/
function getById(frameId, forId) {
    if( FRAME_LAYOUT ) {
	return getFrame(frameId).document.getElementById(forId);
    }
    else {
	alert("Div layout not yet implemented");
	return;
    }
}

/** Abbreviated syntax for document.getElementByName(name)
 **/
function getRadioInForm(frameId, formId, id) {
    if( FRAME_LAYOUT ) {
	return getFrame(frameId).document.forms[formId][id];
    }
    else {
	alert("Div layout not yet implemented");
	return;
    }
}

/* New functionality works with one lesion at a time */
function setNrOfLesionsToOne() {
    meNumberOfLesions = 1;
}

/** Helper function for filling in question 4v, the segment and number
    which are saved in the arrays: meVisualizedByMainSegment and meSegments
    are translated back to the IDs in the form (which are dynamic).

    Note: Function is based upon buildSegmentVisualizTableNew() in form.js
 **/
function translateNumberAndSegmentQuestion4v(){
    segment = meVisualizedByMainSegment[meCurrentLesion];
    number =  meSegments[meCurrentLesion];

    if( number == "none" )
	return "ddsgmsnone" + segment;

    for (var i = 0; i < meSegmentVisualizedTableHelp.length; i++)  {

	arrayStart=parseInt(meSegmentVisualizedTableHelp[i][2]);
	arrayEnd=parseInt(meSegmentVisualizedTableHelp[i][3]);
	denylist=parent.meSegmentVisualizedTableHelp[i][5];

	if( meSegmentVisualizedTableHelp[i][0] == segment && meSegmentVisualizedTableHelp[i][4] == '1' ) {

	    // loop through diffusetablearray, and ignore items of the deny list
	    for (var j = arrayStart; j <= arrayEnd; j++)
	    {
		showme2=meDiffuseTableArray[j][2];

		if ((showme2=='1') && (denylist!=''))
		{
		    //check if not in deny list
		    tmpteststring='|' + number + '|';
		    if (denylist.indexOf(tmpteststring)!=-1)
		    {
			showme2='0';
		    }
		}

		if (showme2=='1')
		{
		    // j+1 is returned because 'none' takes place 0...
		    if( meDiffuseTableArray[j][1] == number ) {
			return "ddsgms" + i + "d" + j;
		    }
		}
	    }
	}
    }
}

/** Some segments cannot be proximal
 */
function checkIfProximalSegmentGetsQuestion4v(){
   var mostProx=parent.getMostProximalSegmentNumber();
   var showme='0';

   for (var i = 0; i < parent.meSegmentVisualizedTableHelp.length; i++) {

       if (parent.meSegmentVisualizedTableHelp[i][0]==mostProx)  {

          showme = parent.meSegmentVisualizedTableHelp[i][4];
       }
   }

   if (showme == '1') {
       return true;
   }

   return false;
}

/** Function sets the lesion number and loads the correct
 *  left side according to the selected dominance
 *
 *  Invoked in the menu
 */
function loadExistingLesion(lesionNumber) {
    meCurrentLesion = lesionNumber;
    setFrameUrl('right','lesion_segments.htm');

    if( meDominance == 'left' ) {
	setFrameUrl('left','selectedleft.htm');
    }
    else {
	setFrameUrl('left','selectedright.htm');
    }
}

/* Fill out question 3
   If no values have been set for lesionNumber nothing will
   be done (length of array = 0)
 */
function loadExistingSegmentValues() {

  // header update
  UpdateCurrentLesion();

  if ( meCompletedLesions[meCurrentLesion] ) {
    for (var i = 0; i < meIndicateSegmentNumber.length; i++) {
      if( meSegmentsInvolved[i][meCurrentLesion] == 1 ) {
	getById('right', 'dd' + i + 'd' + meCurrentLesion).checked = true;
	getFrame('right').lightUpRow('row_' + i + meCurrentLesion);
      }
    }
  }
  else {
    resetExistingFormGlobalVars();
    resetAnswersForLesion(meCurrentLesion);
  }
}

/** Function reads answers to question 4 and sub questions
    and fills out the form accordingly.
 */
function loadExistingQuestion4() {

    // no value present, do nothing
    if( meTotalOcclusion[meCurrentLesion] == '-1' ) {
        return;
    }

     // Question 4, id: formq4, only if total occlustion was set to true, not -1 or false
    if( meTotalOcclusion[meCurrentLesion] && meTotalOcclusion[meCurrentLesion] > 0 ) {
        // Total occlustion is present
        getRadioInForm('right', 'formq4', 'totaloc')[meTotalOcclusion[meCurrentLesion]].checked = true;

        // sub question 4i, id: formq4i
        getById('right', 'q4i').style.display='block';
        for (var i = 0; i < meIndicateSegmentNumber.length; i++) {
            if( meIndicateSegmentNumber[i][meCurrentLesion] ) {
                getById('right', 'dd' + i).checked = true;

		// since question 4i changed to radiobuttons we can have a max of 1 selected
		break;
            }
        }

        // sub question 4ii, id: formq4ii
        getById('right', 'q4ii').style.display='block';
        getRadioInForm('right', 'formq4ii', '3months')[meAgeofTO[meCurrentLesion]].checked = true;

        // sub question 4iii, blunt stump
        getById('right', 'q4iii').style.display='block';
        getRadioInForm('right', 'formq4iii', 'bluntstump')[meBluntStump[meCurrentLesion]].checked = true;
        setFrameUrl('left','diagramblunt.htm');

        // sub question 4iv, bridging
        getById('right', 'q4iv').style.display='block';
        getRadioInForm('right', 'formq4iv', 'bridging')[meBridging[meCurrentLesion]].checked = true;
        setFrameUrl('left','diagrambridging.htm');

        // sub question 4v
        // first show table and label, of highest segment (most proximal)
        if( checkIfProximalSegmentGetsQuestion4v() ) {
            // some set to visible for question 4vii
            getById('right', 'q4vitable' + meProximalSegmentNumber[meCurrentLesion]).style.display = 'block';
            getById('right', 'q4vitable').style.display='block';

            getById('right', 'q4v').style.display = 'block';
	    getById('right', translateNumberAndSegmentQuestion4v()).checked = true;
            setFrameUrl('left','diagramviz.htm');
        }

        // sub question 4vi
        getById('right', 'q4vi').style.display='block';
        getRadioInForm('right', 'formq4vi', 'sidebranch')[meSideBranch[meCurrentLesion]].checked = true;
    }
    else if( meTotalOcclusion[meCurrentLesion] == 0 ) {
        getRadioInForm('right', 'formq4', 'totaloc')[meTotalOcclusion[meCurrentLesion]].checked = true;
    }
}


function loadExistingQuestion5() {
    /** ONLY
        if question 4 VI has been answered:
          - Yes, all sidebranches >=1.5mm
	  - Yes, both sidebranches <1.5mm and >=1.5mm are involved
	OR
          - Question 4 was answered NO (T.O.)

	Than show question 5.
     **/
    if( meSideBranch[meCurrentLesion] > 2 || meTotalOcclusion[meCurrentLesion] == 0 ) {

        getById('right', 'q5').style.display = 'block';

	if( meTrifurcation[meCurrentLesion] != -1 ) {

	    if( meTrifurcation[meCurrentLesion] > 0 ) { // answer = yes
		getRadioInForm('right', 'formq5', 'Trifurcation')[1].checked = true;

		// we need to subtract 1 from the the trifurcation value to activate the
                // correct radiobutton in the form (trifurcation 1 is on place 0 etc.)
		getById('right', 'q5yes').style.display = 'block';
		getRadioInForm('right', 'formq5yes', 'q5yes')[meTrifurcation[meCurrentLesion] - 1].checked = true;
	    }
	    else {
		getRadioInForm('right', 'formq5', 'Trifurcation')[0].checked = true;
	    }
	}
    }
}

function loadExistingQuestion6() {
    // only if answer to question 5 is null
    if( meTrifurcation[meCurrentLesion] == 0 ) {
	getById('right', 'q6').style.display = 'block';
	if( meBifurcation[meCurrentLesion] != '' ) {
	    getById('right', 'q6yes1').style.display = 'block';
            getRadioInForm('right', 'formq6', 'Bifurcation')[1].checked = true;

	    // first sub question (formqyes1)
	    switch(meBifurcation[meCurrentLesion])
	    {
	        case 'A': getRadioInForm('right', 'formq6yes1', 'ABC')[0].checked = true;  break;
	        case 'B': getRadioInForm('right', 'formq6yes1', 'ABC')[1].checked = true;  break;
	        case 'C': getRadioInForm('right', 'formq6yes1', 'ABC')[2].checked = true;  break;
	        case 'D': getRadioInForm('right', 'formq6yes1', 'ABC')[3].checked = true;  break;
	        case 'E': getRadioInForm('right', 'formq6yes1', 'ABC')[4].checked = true;  break;
	        case 'F': getRadioInForm('right', 'formq6yes1', 'ABC')[5].checked = true;  break;
	        case 'G': getRadioInForm('right', 'formq6yes1', 'ABC')[6].checked = true;  break;
	        default: break; // no default action
	    }

	    getById('right', 'q6yes2').style.display = 'block';
	    // second sub question (formqyes2)
	    if( meBifurcationAngulation[meCurrentLesion] != -1 )
		getRadioInForm('right', 'formq6yes2', 'angle')[meBifurcationAngulation[meCurrentLesion]].checked = true;

        }
	else {
	    getRadioInForm('right', 'formq6', 'Bifurcation')[0].checked = true;
	}
    }
}

/** Question 7 is only applicable in case certain segments
    are involved.
    If Question7 was NOT applicable it has been set to 0.
**/
function loadExistingQuestion7(){
    if( Question7Enabled() ){
	getById('right', 'q7').style.display = 'block';
	getRadioInForm('right', 'formq7', 'question7')[meAortoOstialLesion[meCurrentLesion]].checked = true;
    }
}

function loadExistingQuestion8(){
    if( meSevereTortuosity[meCurrentLesion] != -1 ) {
	getById('right', 'q8').style.display = 'block';
	getRadioInForm('right', 'formq8', 'question8')[meSevereTortuosity[meCurrentLesion]].checked = true;
    }
}

/**
 * Question 9 is only shown in case question 4 was answered negatively
 */
function loadExistingQuestion9(){
    if( !(meTotalOcclusion[meCurrentLesion] && meTotalOcclusion[meCurrentLesion] > 0) ) {
        if( meLength[meCurrentLesion] != -1 ) {
            getById('right', 'q9').style.display = 'block';
	    getRadioInForm('right', 'formq9', 'question9')[meLength[meCurrentLesion]].checked = true;
	}
    }
}

function loadExistingQuestion10(){
    if( meHeavyCalcification[meCurrentLesion] != -1 ) {
	getById('right', 'q10').style.display = 'block';
	getRadioInForm('right', 'formq10', 'question10')[meHeavyCalcification[meCurrentLesion]].checked = true;
    }
}

function loadExistingQuestion11(){
    if( meThrombus[meCurrentLesion] != -1 ) {
	getById('right', 'q11').style.display = 'block';
	getRadioInForm('right', 'formq11', 'question11')[meThrombus[meCurrentLesion]].checked = true;
    }
}

function loadExistingComment(){
    if( meThrombus[meCurrentLesion] != -1 ) {
        getById('right', 'comment').style.display = 'block';
        getById('right', 'thecomment').value = meComment[meCurrentLesion];
    }
}

function showSaveButton() {
    getById('right', 'savebutton').style.display = 'block';
}

function resetExistingFormGlobalVars(){
    formVarBlnQ12Enabled[meCurrentLesion] = false;
    formVarBlnSegmentVisualizedVisual[meCurrentLesion] = false;
    formVarBlnSkip5[meCurrentLesion] = false;
    formVarBlnSkip6[meCurrentLesion] = false;
    formVarBlnSkip6by5[meCurrentLesion] = false;
    formVarBlnSkip7[meCurrentLesion] = false;
    formVarIDSegmentTableFirstVisible[meCurrentLesion] = '';
    formVarIDSegmentTableLastVisible[meCurrentLesion] = '';
    formVarIDProxSegmentFirstVisible[meCurrentLesion] = '';
    formVarIDProxSegmentLastVisible[meCurrentLesion] = '';
    formVarBlnSaved[meCurrentLesion] = false;
    formVarBlnSegmentTableContainsElements[meCurrentLesion] = false;
    formVarDiffuseDiseaseScore[meCurrentLesion] = 0;
}

/** Function loads all questions in case a completed lesion
 *  has been selected for edit.
 */
function loadExistingFormValues() {

    // lesion has been found, load data and fill out form
    if( meCompletedLesions[meCurrentLesion] ) {
	loadExistingQuestion4();
	loadExistingQuestion5();
	loadExistingQuestion6();
	loadExistingQuestion7();
	loadExistingQuestion8();
	loadExistingQuestion9();
	loadExistingQuestion10();
        loadExistingQuestion11();
        loadExistingComment();
        showSaveButton();
    }
}

/** Function returns the lesion number of the last lesion
    (order of filling-out) that was completed.
 **/
function lookupLastCompletedLesion() {

    if( meCompletedLesions[0] == 0 )
	return 0;

    for( var i = 1; i < myDefaultArrayLength; i++ ) {
	if( meCompletedLesions[i] == 0 ) {
	    return i-1;
	}
    }

    return myDefaultArrayLength;
}

/** This function is based on the reset() function, and performs
    the same actions just for 1 lesion.
 **/
function resetAnswersForLesion(selectedLesion) {
    // diffuse disease is used by question 12 does not
    // need a reset.
    // resetDiffuseDiseaseArray();

    for( var i = 0; i < 25; i++ ){
	meSegmentsInvolved[i][selectedLesion] = 0;
     }

    for( var i = 0; i < 25; i++ ){
	meIndicateSegmentNumber[i][selectedLesion] = 0;
     }

    meCompletedLesions[selectedLesion] = 0;
    meScorePerLesion[selectedLesion] = 0;

    meTotalOcclusion[selectedLesion]=-1;
    meProximalSegmentNumber[selectedLesion]=-1;
    meAgeofTO[selectedLesion]=-1;
    meAgeofTOScore[selectedLesion]=0;
    meBluntStump[selectedLesion]=-1;
    meBluntStumpScore[selectedLesion]=0;
    meBridging[selectedLesion]=-1;
    meBridgingScore[selectedLesion]=0;
    meSideBranch[selectedLesion]=-1;
    meSideBranchScore[selectedLesion]=0;

    // question 5
    meSegments[selectedLesion]='Skipped';
    meVisualizedByMainSegment[selectedLesion]=-1;

    // question 6
    meTrifurcation[selectedLesion]=-1;
    meTrifurcationScore[selectedLesion]=0;
    meBifurcation[selectedLesion]='';
    meBifurcationScore[selectedLesion]=0;
    meBifurcationAngulation[selectedLesion]=-1;
    meBifurcationAngulationScore[selectedLesion]=0;

    // question 7
    meAortoOstialLesion[selectedLesion]==-1;
    meAortoOstialLesionScore[selectedLesion]=0;

    // question 8
    meSevereTortuosity[selectedLesion]=-1;
    meSevereTortuosityScore[selectedLesion]=0;

    // question 9
    meLength[selectedLesion]=-1;
    meLengthScore[selectedLesion]=0;

    // question 10
    meHeavyCalcification[selectedLesion]=-1;
    meHeavyCalcificationScore[selectedLesion]=0;

    // question 11
    meThrombus[selectedLesion]=-1;
    meThrombusScore[selectedLesion]=0;

    // comment
    meComment[selectedLesion]='';
    meTotalOcclusionScore[selectedLesion]=0;

    meVisualizedByContrastScore[selectedLesion]=0;
    meQ6Skipped[selectedLesion]=false;
    meQ7Skipped[selectedLesion]=false;

    // global form values (have been moved from form.js to here)
    formVarBlnQ12Enabled[selectedLesion] = false;
    formVarBlnSegmentVisualizedVisual[selectedLesion] = false;
    formVarBlnSkip5[selectedLesion] = false;
    formVarBlnSkip6[selectedLesion] = false;
    formVarBlnSkip6by5[selectedLesion] = false;
    formVarBlnSkip7[selectedLesion] = false;
    formVarIDSegmentTableFirstVisible[selectedLesion] = '';
    formVarIDSegmentTableLastVisible[selectedLesion] = '';
    formVarIDProxSegmentFirstVisible[selectedLesion] = '';
    formVarIDProxSegmentLastVisible[selectedLesion] = '';
    formVarBlnSaved[selectedLesion] = false;
    formVarBlnSegmentTableContainsElements[selectedLesion] = false;
    formVarDiffuseDiseaseScore[selectedLesion] = 0;
}


/** This function overwrites the values of the previous
    lesion (selectedLesion-1) with the answers of 'selectedLesion'.
 **/
function shiftAnswersBackForLesion(selectedLesion) {

    // first clear the lesion that will be overwritten
    resetAnswersForLesion(selectedLesion-1);

    // shift completed value back
    meCompletedLesions[selectedLesion-1] = meCompletedLesions[selectedLesion];
    meScorePerLesion[selectedLesion-1] = meScorePerLesion[selectedLesion];

    // copy segment selection
    for( var i = 0; i < 25; i++ ){
	meSegmentsInvolved[i][selectedLesion-1] = meSegmentsInvolved[i][selectedLesion];
     }

    for( var i = 0; i < 24; i++ ){
	meIndicateSegmentNumber[i][selectedLesion-1] = meIndicateSegmentNumber[i][selectedLesion];
     }

    // question 4
    meTotalOcclusion[selectedLesion-1] = meTotalOcclusion[selectedLesion];
    meProximalSegmentNumber[selectedLesion-1] = meProximalSegmentNumber[selectedLesion];
    meAgeofTO[selectedLesion-1] = meAgeofTO[selectedLesion];
    meAgeofTOScore[selectedLesion-1] = meAgeofTOScore[selectedLesion];
    meBluntStump[selectedLesion-1] = meBluntStump[selectedLesion];
    meBluntStumpScore[selectedLesion-1] = meBluntStumpScore[selectedLesion];
    meBridging[selectedLesion-1] = meBridging[selectedLesion];
    meBridgingScore[selectedLesion-1] = meBridgingScore[selectedLesion];
    meSideBranch[selectedLesion-1] = meSideBranch[selectedLesion];
    meSideBranchScore[selectedLesion-1] = meSideBranchScore[selectedLesion];

    // question 5
    meSegments[selectedLesion-1] = meSegments[selectedLesion];
    meVisualizedByMainSegment[selectedLesion-1] = meVisualizedByMainSegment[selectedLesion];

    // question 6
    meTrifurcation[selectedLesion-1] = meTrifurcation[selectedLesion];
    meTrifurcationScore[selectedLesion-1] = meTrifurcationScore[selectedLesion];
    meBifurcation[selectedLesion-1] = meBifurcation[selectedLesion];
    meBifurcationScore[selectedLesion-1] = meBifurcationScore[selectedLesion];
    meBifurcationAngulation[selectedLesion-1] = meBifurcationAngulation[selectedLesion];
    meBifurcationAngulationScore[selectedLesion-1]= meBifurcationAngulationScore[selectedLesion];

    // question 7
    meAortoOstialLesion[selectedLesion-1] = meAortoOstialLesion[selectedLesion];
    meAortoOstialLesionScore[selectedLesion-1] = meAortoOstialLesionScore[selectedLesion];

    // question 8
    meSevereTortuosity[selectedLesion-1] = meSevereTortuosity[selectedLesion];
    meSevereTortuosityScore[selectedLesion-1] = meSevereTortuosityScore[selectedLesion];

    // question 9
    meLength[selectedLesion-1] = meLength[selectedLesion];
    meLengthScore[selectedLesion-1] = meLengthScore[selectedLesion];

    // question 10
    meHeavyCalcification[selectedLesion-1] = meHeavyCalcification[selectedLesion];
    meHeavyCalcificationScore[selectedLesion-1] = meHeavyCalcificationScore[selectedLesion];

    // question 11
    meThrombus[selectedLesion-1] = meThrombus[selectedLesion];
    meThrombusScore[selectedLesion-1] = meThrombusScore[selectedLesion];

    // comment
    meComment[selectedLesion-1] = meComment[selectedLesion];
    meTotalOcclusionScore[selectedLesion-1] = meTotalOcclusionScore[selectedLesion];

    meVisualizedByContrastScore[selectedLesion-1] = meVisualizedByContrastScore[selectedLesion];
    meQ6Skipped[selectedLesion-1] = meQ6Skipped[selectedLesion];
    meQ7Skipped[selectedLesion-1] = meQ7Skipped[selectedLesion];

    // global form values (have been moved from form.js to here)
    formVarBlnQ12Enabled[selectedLesion - 1] = formVarBlnQ12Enabled[selectedLesion];
    formVarBlnSegmentVisualizedVisual[selectedLesion - 1] = formVarBlnSegmentVisualizedVisual[selectedLesion];
    formVarBlnSkip5[selectedLesion - 1] = formVarBlnSkip5[selectedLesion];
    formVarBlnSkip6[selectedLesion - 1] = formVarBlnSkip6[selectedLesion];
    formVarBlnSkip6by5[selectedLesion - 1] = formVarBlnSkip6by5[selectedLesion];
    formVarBlnSkip7[selectedLesion - 1] = formVarBlnSkip7[selectedLesion];
    formVarIDSegmentTableFirstVisible[selectedLesion - 1] = formVarIDSegmentTableFirstVisible[selectedLesion];
    formVarIDSegmentTableLastVisible[selectedLesion - 1] = formVarIDSegmentTableLastVisible[selectedLesion];
    formVarIDProxSegmentFirstVisible[selectedLesion - 1] = formVarIDProxSegmentFirstVisible[selectedLesion];
    formVarIDProxSegmentLastVisible[selectedLesion - 1] = formVarIDProxSegmentLastVisible[selectedLesion];
    formVarBlnSaved[selectedLesion - 1] = formVarBlnSaved[selectedLesion];
    formVarBlnSegmentTableContainsElements[selectedLesion - 1] = formVarBlnSegmentTableContainsElements[selectedLesion];
    formVarDiffuseDiseaseScore[selectedLesion - 1] = formVarDiffuseDiseaseScore[selectedLesion];

}

/**
   Function removes the selected lesion.

   The consequence is that all answers of the following lesions
   (in the sense of order of filling-out) are shifted one place
   back in the answer-arrays.
 **/
function removeLesion(toBeRemovedLesion) {

    lastCompletedLesion = lookupLastCompletedLesion();
    
    // Decrease lesion counts and scores

    // set meCurrentLesion temporary to the toBeRemoved lesion
    // to ensure that UpdateScore updates meScorePerLesion correctly
    meCurrentLesion = toBeRemovedLesion;
    meNumberOfLesions = meNumberOfLesions - 1;
    requireUpdateScore(0, meScorePerLesion[toBeRemovedLesion]);
    meScorePerLesion[toBeRemovedLesion] = 0;

    // reset all values of the deleted lesion
    resetAnswersForLesion(toBeRemovedLesion);

    // we only have to shift back if not last completed lesion
    if( toBeRemovedLesion != lastCompletedLesion ) {
	for( var i = toBeRemovedLesion+1; i <= lastCompletedLesion; i++ ) {
	    shiftAnswersBackForLesion(i);

	    // reset the values of the just shifted-back lesion
	    resetAnswersForLesion(i);
	}
    }

    parent.setFrameUrl('left','overview.htm');
    parent.setFrameUrl('right','menu.htm');
    meCurrentLesion = lookupLastCompletedLesion();
    UpdateCurrentLesion();
}

//Vessels shown in lesion (-1 means not shown yet! else it is the lesion number)
var vessel1=-1; //0-7
var vessel2=-1; //8
var vessel3=-1; //9-15
var vessel4=-1; //16-24

function resetVesselScores() {

    if (vessel1==meCurrentLesion)
    {
	subResetCheckVessel(0,7);
    }

    if (vessel2==meCurrentLesion)
    {
	subResetCheckVessel(8,8);
    }

    if (vessel3==meCurrentLesion)
    {
	subResetCheckVessel(9,15);
    }

    if (vessel4==meCurrentLesion)
    {
	subResetCheckVessel(16,24);
    }
}

/** Resets all vessels because we are not in 1
    lesion but do it after all lesions have been
    filled out.
 **/
function resetVesselScoresForAll() {
	subResetCheckVessel(0,7);
	subResetCheckVessel(8,8);
	subResetCheckVessel(9,15);
	subResetCheckVessel(16,24);
}

function showVessel(vesselnumber)
{

    if (vesselnumber==1)
    {
	//already shown
	if ((vessel1!=-1) && (vessel1!=meCurrentLesion))
	{
	    return false;
	}
	//check if selected in Q3
	if (subCheckVessel(0,7))
	{
	    vessel1=meCurrentLesion;

	    return true;
	}

    }

    if (vesselnumber==2)
    {
	//already shown
	if ((vessel2!=-1) && (vessel2!=meCurrentLesion))

	    return false
		if (subCheckVessel(8,8))
		{
		    vessel2=meCurrentLesion;

		    return true;
		}

    }

    if (vesselnumber==3)
    {
	//already shown
	if ((vessel3!=-1) && (vessel3!=meCurrentLesion))
	    return false
		if ((subCheckVessel(9,15))  || (subCheckVessel(8,8)))
		{
		    vessel3=meCurrentLesion;

		    return true;
		}
    }

    if (vesselnumber==4)
    {
	//already shown
	if ((vessel4!=-1) && (vessel4!=meCurrentLesion))
	    return false
		if ((subCheckVessel(16,24))  || (subCheckVessel(8,8)))
		{
		    vessel4=meCurrentLesion;

		    return true;
		}
    }


    return false;
}

/** New function that is based on showVessel, but in stead of
    working on the currentLesion it first creates an artificial lesion
    involving all segments of all other lesions to calculate the
    same functionality
**/
function showVesselForAll(vesselnumber)
{
    if (vesselnumber==1)
    {
	//check if selected in Q3
	if (subCheckVesselForAll(0,7))
	{
	    vessel1=meCurrentLesion;

	    return true;
	}
    }

    if (vesselnumber==2)
    {
	if (subCheckVesselForAll(8,8))
	{
	    vessel2=meCurrentLesion;

	    return true;
	}

    }

    if (vesselnumber==3)
    {
	if ((subCheckVesselForAll(9,15))  || (subCheckVesselForAll(8,8)))
	{
	    vessel3=meCurrentLesion;

	    return true;
	}
    }

    if (vesselnumber==4)
    {

	if ((subCheckVesselForAll(16,24))  || (subCheckVesselForAll(8,8)))
	{
	    vessel4=meCurrentLesion;

	    return true;
	}
    }


    return false;
}

function resetMeAllSegmentsMerged() {

    for (var i = 0; i < 25; i++)
    {
	meAllSegmentsMerged[i] = 0;
    }
}

function updateMeAllSegmentsMerged() {
    // loop over
    for (var i = 0; i < 25; i++)
    {
	for (var j = 0; j < myDefaultArrayLength; j++)
	{
	    if( meSegmentsInvolved[i][j] == 1 )
		meAllSegmentsMerged[i] = 1;
	}
    }
}

function subCheckVesselForAll(iStart,IEnd) {

    for (var  i = iStart; i <= IEnd; i++)
    {
	if (meAllSegmentsMerged[i] == 1 )
	    return true;
    }

    return false;
}


function subCheckVessel(iStart,IEnd)
{	// return true if one is set
    for (var i = iStart; i <= IEnd; i++)
    {
	if (meSegmentsInvolved[i][meCurrentLesion]==1)
	    return true
	}

    return false
}

function CheckDiffuseDisease(iStart,IEnd)
{	// return true if one is set
    for (var i = iStart; i <= IEnd; i++)
    {
	if (meDiffuseDiseaseArray[i]==1)
	    return true
    }

    return false
}


function subResetCheckVessel(iStart,IEnd)
{
    var oldValue;
    for (var i = iStart; i <= IEnd; i++)
    {
	oldValue=meDiffuseDiseaseArray[i];
	UpdateScore(-(oldValue));
	meDiffuseDiseaseArray[i]=0;
    }
    showScore();
}

var blnInitCalled=false;
var meDominance;
var ApplicationEnded=false;
var meDiffuseDiseaseArray = new Array(25);

var meCurrentLesion;

/** Added array to keep scores per lesion */
var meScore;
var meScorePerLesion = new Array(myDefaultArrayLength);

var meNumberOfLesions;

/** Added these variables for Syntax Score II **/
var meScore2Active = false;
/** can be equal to meScore or manually overwritten **/ 
var meScore2 = 0;
/** outcome variables of ss2 **/
var meScore2CABG_M; // mortality rates
var meScore2PCI_M;
var meScore2CABG;   // scores
var meScore2PCI;
var meScore2PValue;


/** To control flow of application, in case > 1 we ignore values
    of ss1 in ss2 **/
var ss2Runs = 0;

var meSideBranchAnswers= [['No'],
			  ['Yes, all sidebranches &lt;1.5mm'],
			  ['Yes, all sidebranches &gt;=1.5mm'],
			  ['Yes, both sidebranches &lt;1.5mm and &gt;=1.5mm are involved']];

//lesion
var meSegmentsInvolved = [
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0],
			  [0,0,0,0,0,0,0,0,0,0,0,0]];//24

// label - segment - visible - scoreFactorRight - scoreFactorLeft
// used in the visualization of question 4v
var meDiffuseTableArray = [
			   ['RCA proximal','1','1','1','1','0'],//0
			   ['RCA mid','2','1','1','1','0'],
			   ['RCA distal','3','1','1','1','0'],
			   ['Posterior descending','4','1','1','1','0'], //3
			   ['Posterolateral from RCA','16','1','0','0.5','0'],//4
			   ['Posterolateral from RCA','16a','1','0','0.5','0'],//5
			   ['Posterolateral from RCA','16b','1','0','0.5','0'],//6
			   ['Posterolateral from RCA','16c','1','0','0.5','0'],//7
			   ['Left main','5','1','1','5','6'],
			   ['LAD proximal','6','1','1','3.5','3.5'],//9
			   ['LAD mid','7','1','1','2.5','2.5'],
			   ['LAD apical','8','1','0','1','1'],//11
			   ['First diagonal','9','1','0','1','1'],//12
			   ['Add. first diagonal','9a','1','0','1','1'],
			   ['Second diagonal','10','1','0','0.5','0.5'],//14
			   ['Add. second diagonal','10a','1','0','0.5','0.5'],
			   ['Proximal circumflex','11','1','1','1.5','2.5'],//16
			   ['Intermediate/anterolateral','12','1','0','1','1'],
			   ['Obtuse marginal','12a','1','0','1','1'],
			   ['Obtuse marginal','12b','1','0','1','1'],
			   ['Distal circumflex','13','1','1','0.5','1.5'], //20
			   ['Left posterolateral','14','1','1','0.5','1'],//21
			   ['Left posterolateral','14a','1','0','0.5','1'],
			   ['Left posterolateral','14b','1','0','0.5','1'],
			   ['Posterior descending','15','1','0','0','1']]; //24

// Main segment , label, start in array 'meDiffuseTableArray' ,
//   end in array 'meDiffuseTableArray' //showme // denylist
// Note: used in the visualization of question 4v
//   'start in array'  and 'end in array' values refer to the above meDiffuseTableArray
//   and the denylist is there to skip some intermediate values
var meSegmentVisualizedTableHelp =[
				   ['1','If, T.O. in segment 1',0,4,'1',''],//0
				   ['2','If, T.O. in segment 2',1,4,'1',''],
				   ['3','If, T.O. in segment 3',2,4,'1',''],
				   ['4','If, T.O. in segment 4',3,4,'1','|4|16|'],//nl 3 aanpassing MVG 2016
				   ['16','If, T.O. in segment 16',4,4,'1',''], //nl 4
				   ['16a','If, T.O. in segment 16a',5,5,'1',''], //nl 5
				   ['16b','If, T.O. in segment 16b',6,6,'1',''], //nl 6
				   ['16c','If, T.O. in segment 16c',7,7,'1',''], //nl 7
				   ['5','If, T.O. in segment 5',8,24,'1','|9|9a|10|10a|12|12a|12b|14a|14b|'],
				   ['6','If, T.O. in segment 6',9,11,'1',''],
				   ['7','If, T.O. in segment 7',10,11,'1',''],
				   ['8','If, T.O. in segment 8',11,11,'1',''],//8
				   ['9','If, T.O. in segment 9',12,12,'1',''],
				   ['9a','If, T.O. in segment 9a',13,13,'1',''],
				   ['10','If, T.O. in segment 10',14,14,'1',''],
				   ['10a','If, T.O. in segment 10a',15,15,'1',''],
				   ['11','If, T.O. in segment 11',16,24,'1','|12|12a|12b|14a|14b|'],
				   ['12','If, T.O. in segment 12',17,17,'1',''],
				   ['12a','If, T.O. in segment 12a',18,18,'1',''],
				   ['12b','If, T.O. in segment 12b',19,19,'1',''],
				   ['13','If, T.O. in segment 13',20,21,'1',''],
				   ['14','If, T.O. in segment 14',21,21,'1',''],
				   ['14a','If, T.O. in segment 14a',22,22,'1',''],
				   ['14b','If, T.O. in segment 14b',23,23,'1',''],
				   ['15','If, T.O. in segment 15',24,24,'1','']];//nr 15

/* First column of segment table with top hierarchy info */
var meDiffuseTableArray1stColumn = [
                           '<div class="darkred"><b>RCA</b></div>',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '<div class="darkred"><b>LM</b></div>',
			   '<div class="darkred"><b>LAD</b></div>',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '<div class="darkred"><b>LCX</b></div>',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;',
			   '&nbsp;'];

var meBifurcationMapping = new Array(7);
meBifurcationMapping['A'] = 'Medina 1,0,0';
meBifurcationMapping['B'] = 'Medina 0,1,0';
meBifurcationMapping['C'] = 'Medina 1,1,0';
meBifurcationMapping['D'] = 'Medina 1,1,1';
meBifurcationMapping['E'] = 'Medina 0,0,1';
meBifurcationMapping['F'] = 'Medina 1,0,1';
meBifurcationMapping['G'] = 'Medina 0,1,1';


var meTotalOcclusion = new Array(myDefaultArrayLength);
var meProximalSegmentNumber = new Array(myDefaultArrayLength);

//new Q4i instead of meProximalSegmentNumber
var meIndicateSegmentNumber = [
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0],
			       [0,0,0,0,0,0,0,0,0,0,0,0]];//23

/**
 Answers to questions are saved in these arrays
 In which array element 1 contains the answer for lesion 1
   array elem 2 for lesion 2 etc.
**/
var meAgeofTO = new Array(myDefaultArrayLength);
var meAgeofTOScore = new Array(myDefaultArrayLength);
var meBluntStump = new Array(myDefaultArrayLength);
var meBluntStumpScore = new Array(myDefaultArrayLength);
var meBridging = new Array(myDefaultArrayLength);
var meBridgingScore = new Array(myDefaultArrayLength);
var meSideBranch = new Array(myDefaultArrayLength);
var meSideBranchScore = new Array(myDefaultArrayLength);
var meSegments = new Array(myDefaultArrayLength);
var meVisualizedByMainSegment = new Array(myDefaultArrayLength);

var meTrifurcation = new Array(myDefaultArrayLength);
var meTrifurcationScore = new Array(myDefaultArrayLength);
var meBifurcation = new Array(myDefaultArrayLength);
var meBifurcationScore = new Array(myDefaultArrayLength);
var meBifurcationAngulation = new Array(myDefaultArrayLength);
var meBifurcationAngulationScore = new Array(myDefaultArrayLength);
var meAortoOstialLesion = new Array(myDefaultArrayLength);
var meAortoOstialLesionScore = new Array(myDefaultArrayLength);
var meSevereTortuosity = new Array(myDefaultArrayLength);
var meSevereTortuosityScore = new Array(myDefaultArrayLength);
var meLength = new Array(myDefaultArrayLength);
var meLengthScore = new Array(myDefaultArrayLength);
var meHeavyCalcification = new Array(myDefaultArrayLength);
var meHeavyCalcificationScore = new Array(myDefaultArrayLength);
var meThrombus = new Array(myDefaultArrayLength);
var meThrombusScore = new Array(myDefaultArrayLength);
var meQ6Skipped = new Array(myDefaultArrayLength);
var meQ7Skipped = new Array(myDefaultArrayLength);
var meComment = new Array(myDefaultArrayLength);
var meTotalOcclusionScore = new Array(myDefaultArrayLength);
var meVisualizedByContrastScore = new Array(myDefaultArrayLength);

/**
   Reset score Per Lesion
 */
function resetMeScorePerLesion()
{
    meScorePerLesion = [0,0,0,0,0,0,0,0,0,0,0,0];
}

function FillSegmentVisualizedArray()
{
    // segment,label,segmentnubmer,visible



    for (var i = 0; i < meSegmentVisualizedTableHelp.length; i++)
    {
	meSegmentVisualizedTableHelp[i][4]='1';
    }

    var number='';
    var showme='0';
    var arrayStart=0;
    var arrayEnd=0;
    var showme2='0';
    var denylist='';
    var tmpteststring='';

    //header



    for (var i = 0; i < meSegmentVisualizedTableHelp.length; i++)
    {
	showme=meSegmentVisualizedTableHelp[i][4];
	arrayStart=parseInt(meSegmentVisualizedTableHelp[i][2]);
	arrayEnd=parseInt(meSegmentVisualizedTableHelp[i][3]);
	denylist=meSegmentVisualizedTableHelp[i][5];

	if (showme=='1')
	{
	    nrOfItems=0;

	    for (var j = arrayStart;j <= arrayEnd; j++)
	    {
		number=meDiffuseTableArray[j][1];
		showme2=meDiffuseTableArray[j][2];

		if ((showme2=='1') && (denylist!=''))
		{
		    //check if not in deny list
		    tmpteststring='|' + number + '|'
		    if (denylist.indexOf(tmpteststring)!=-1)
		    {
			showme2='0';
		    }
		}

		if (showme2=='1')
		{

		    nrOfItems=nrOfItems+1;
		}
	    }

	    if (nrOfItems<=1)
	    {
		meSegmentVisualizedTableHelp[i][4]='0';

	    }
	}
    }
}

function setHeaderText(id,text)
{
    if(window.frames['header'].document.getElementById(id) != null)
    {
	window.frames['header'].document.getElementById(id).innerHTML=text;
    }
}

/** SetNumberOfLesions, this function sets the complete
    meSegmentsInvolved and meIndicateSegmentNumber arrays (to 0)
 */
function SetNumberOfLesions(NumberOfLesions)
{
    meNumberOfLesions=NumberOfLesions;
    for (var i = 0; i < meDiffuseDiseaseArray.length; i++)
    {
	for (var j = 0; j < meNumberOfLesions; j++)
	{
	    meSegmentsInvolved[i][j]=0;
	    meIndicateSegmentNumber[i][j]=0;
	}
    }
    setFrameUrl('right','lesion_segments.htm');
}

function resetIndicateSegmentNumber()
{
    for (var j = 0; j < meIndicateSegmentNumber.length; j++)
    {
	meIndicateSegmentNumber[j][meCurrentLesion]=0;
    }

}

function fillDiffuseTableArray()
{
    //set all visible
    for (var i = 0; i < meDiffuseTableArray.length; i++)
    {
	meDiffuseTableArray[i][2]='1';
    }

    if (meDominance=='left')
    {
	meDiffuseTableArray[3][2]='0';
	meDiffuseTableArray[4][2]='0';
	meDiffuseTableArray[5][2]='0';
	meDiffuseTableArray[6][2]='0';
	meDiffuseTableArray[7][2]='0';
	//meDiffuseTableArray[13][2]='0';
	//meDiffuseTableArray[2][3]='0';
	//meDiffuseTableArray[3][3]='0';
    }

    if (meDominance=='right')
    {
	meDiffuseTableArray[24][2]='0';

	//meDiffuseTableArray[21][2]='0';
    }

}

function actionDiffuseDeseaseNo(blnYes)
{
    if (blnYes)
    {
	showScore();
    }
    else
    {
	resetDiffuseDiseaseArray();
	meScore=0;
	showScore();
	setFrameUrl('right','nroflesions.htm')
    }
}

/** navigates to next page **/
function SegmentsInvolvedSave()
{
    setFrameUrl('left','overview.htm');
    setFrameUrl('right','disback.htm');

    // only header is updated here
    UpdateCurrentLesion();
}


function showScore()
{
    setHeaderText('scorelabel','Score: ');
    setHeaderText("score",GetScore());
}

function hideScore()
{
    setHeaderText('scorelabel','');
    setHeaderText("score",'');
}


function reset()
{
    //set default values
    //meDominance='';
    meNumberOfLesions=0;
    meScore=0;
    resetMeScorePerLesion();
    resetMeCompletedLesions();
    resetMeAllSegmentsMerged();
    SegmentsInvolved=0;
    resetDiffuseDiseaseArray();

    meCurrentLesion=0;
    for (var i = 0; i < myDefaultArrayLength; i++)
    {
	meTotalOcclusion[i]=-1;
	meProximalSegmentNumber[i]=-1;
	meAgeofTO[i]=-1;
	meAgeofTOScore[i]=0;
	meBluntStump[i]=-1;
	meBluntStumpScore[i]=0;
	meBridging[i]=-1;
	meBridgingScore[i]=0;
	meSideBranch[i]=-1;
	meSideBranchScore[i]=0;
	meSegments[i]='Skipped';
	meVisualizedByMainSegment[i]=-1;
	meTrifurcation[i]=-1;
	meTrifurcationScore[i]=0;
	meBifurcation[i]='';
	meBifurcationScore[i]=0;
	meBifurcationAngulation[i]=-1;
	meBifurcationAngulationScore[i]=0;
	meAortoOstialLesion[i]==-1;
	meAortoOstialLesionScore[i]=0;
	meSevereTortuosity[i]=-1;
	meSevereTortuosityScore[i]=0;
	meLength[i]=-1;
	meLengthScore[i]=0;
	meHeavyCalcification[i]=-1;
	meHeavyCalcificationScore[i]=0;
	meThrombus[i]=-1;
	meThrombusScore[i]=0;
	meComment[i]='';
	meTotalOcclusionScore[i]=0;
	meVisualizedByContrastScore[i]=0;
	meQ6Skipped[i]=false;
	meQ7Skipped[i]=false;
    }
}

function setQ6Skipped(Value)
{
    meQ6Skipped[meCurrentLesion]=Value;
}

function setQ7Skipped(Value)
{

    meQ7Skipped[meCurrentLesion]=Value;
}

function resetDiffuseDiseaseArray()
{
    for (var i = 0; i < meDiffuseDiseaseArray.length; i++)
    {
	meDiffuseDiseaseArray[i]=0;
    }
}


function setFrameUrl(framename,NewLocation)
{
    //set new URL for frame
    window.frames[framename].window.location.href=NewLocation;
}


/** Function adapted to directly go to the lesion_segments.htm
    page, because the number of lesions will not be fixed
    anymore. Therefore nrOfLesions is set to 1 as well
 **/
function setDominance(Dominance)
{
    //reset all new dominance is set incase of back!!
    reset();

    meDominance=Dominance;
    fillDiffuseTableArray();
    FillSegmentVisualizedArray();

    if (meDominance=='left')
    {
	setFrameUrl('left','selectedleft.htm');
	parent.setHeaderText('dominance','Dominance: left');
    }
    if (meDominance=='right')
    {
	setFrameUrl('left','selectedright.htm');
	parent.setHeaderText('dominance','Dominance: right');
    }

    // setFrameUrl('right','nroflesions.htm');
    setNrOfLesionsToOne();
    setFrameUrl('right','lesion_segments.htm');
}

function setDiffuseDisease(arraynumber,me)
{
    var oldValue=0;
    var newValue=0;
    if (me.checked)
    {
	newValue=1;
    }

    oldValue = meDiffuseDiseaseArray[arraynumber]

    if (oldValue!=newValue)
    {
	UpdateScore(-(oldValue));
	UpdateScore(newValue);
	showScore();
    }

    meDiffuseDiseaseArray[arraynumber]=newValue;
}

function Question7Enabled()
{
    // 1
    if (meSegmentsInvolved[0][meCurrentLesion]==1)
    {

	return true
	    }
    // 5
    if (meSegmentsInvolved[8][meCurrentLesion]==1)
    {

	return true
	    }
    // 6
    if (meSegmentsInvolved[9][meCurrentLesion]==1)
    {

	return true
	    }
    // 11
    if (meSegmentsInvolved[16][meCurrentLesion]==1)
    {
	return true
    }

    return false;
}

/** toggle function of segment **/
function SetSegmentsInvolved(Segment,Lesion,me)
{
    if (me.checked)
    {
	if (meSegmentsInvolved[Segment][Lesion]==0)
	{
	    meSegmentsInvolved[Segment][Lesion]=1;
	}
    }
    else
    {
	if (meSegmentsInvolved[Segment][Lesion]==1)
	{
	    meSegmentsInvolved[Segment][Lesion]=0;
	}
    }
}

function resetTotalOcclusionScore()
{
    resetIndicateSegmentNumber();
    UpdateScore(-(meTotalOcclusionScore[meCurrentLesion]));
    meTotalOcclusionScore[meCurrentLesion]=0;
    showScore();
}

function CheckIndicateSegmentNumber()
{

    for (var i = 0; i < meIndicateSegmentNumber.length; i++)
    {
	if (meIndicateSegmentNumber[i][meCurrentLesion]==1)
	    return true;
    }

    return false;
}


function CalculateTotalOcclusion()
{
    var CalculationFactor=2;
    var arrayDepth=4; //right

    var newScore=0;
    var oldScore=meTotalOcclusionScore[meCurrentLesion];



    if (meTotalOcclusion[meCurrentLesion]==1)
    {
        CalculationFactor=5;
    }

    if (meDominance=='left')
    {
	arrayDepth=5;
    }
    //now calculate


    for (var i = 0; i < meDiffuseTableArray.length; i++)
    {
	if (meSegmentsInvolved[i][meCurrentLesion]==1)
	{
	    CalculationFactor=2;

	    if ((meIndicateSegmentNumber[i][meCurrentLesion]==1))
	    {
		CalculationFactor=5;
	    }

	    newScore = newScore + ((meDiffuseTableArray[i][arrayDepth])*CalculationFactor);
	}
    }

    meTotalOcclusionScore[meCurrentLesion]=newScore;
    requireUpdateScore(newScore,oldScore);
}

function SetTotalOcclusion(Value)
{
    // set value for currentLession
    meTotalOcclusion[meCurrentLesion]=Value;

    CalculateTotalOcclusion();
    // calculation to be made
}

function SetProximalSegmentNumber(Value)
{
    meProximalSegmentNumber[meCurrentLesion]=Value;
}

/** Used by question 4V, it returns the first segment
    ordered by segment number.
    note: as a side effect the meProximalSegmentNumber variable
          is set.
 */
function getMostProximalSegmentNumber()
{
    //new this one is not set anymore
    for (var i = 0; i < meIndicateSegmentNumber.length; i++)
    {
	if (meIndicateSegmentNumber[i][meCurrentLesion]==1)
	{
	    SetProximalSegmentNumber(parent.meDiffuseTableArray[i][1]);

	    return parent.meDiffuseTableArray[i][1];
	}
    }

    return 0;
}

function SetIndicateSegmentNumber(segment,me)
{


    if (me.checked)
    {
	meIndicateSegmentNumber[segment][meCurrentLesion]=1;
    }
    else
    {
	meIndicateSegmentNumber[segment][meCurrentLesion]=0;
    }
    //calculate score
    CalculateTotalOcclusion();

}


function GetProximalSegmentNumber()
{

    return meProximalSegmentNumber[meCurrentLesion];
}


function SetAgeOfTO(Value)
{
    //1 or 2 scores 1
    //0 scores nothing
    //-1 nothing answered
    meAgeofTO[meCurrentLesion]=Value;
    var oldScore=meAgeofTOScore[meCurrentLesion];
    var newScore=0;

    if ((Value==2) || (Value==1))
    {
	newScore=1;
    }
    requireUpdateScore(newScore,oldScore);
    meAgeofTOScore[meCurrentLesion]=newScore;
}


function SetBluntStump(Value)
{
    meBluntStump[meCurrentLesion]=Value;
    var oldScore=meBluntStumpScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=1;
    }

    requireUpdateScore(newScore,oldScore);
    meBluntStumpScore[meCurrentLesion]=newScore;
}

function setBridging(Value)
{
    meBridging[meCurrentLesion]=Value;
    var oldScore=meBridgingScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=1;
    }

    requireUpdateScore(newScore,oldScore);

    meBridgingScore[meCurrentLesion]=newScore;
}

function resetVisualizedByContrastScore()
{
    var oldScore=meVisualizedByContrastScore[meCurrentLesion];
    meVisualizedByContrastScore[meCurrentLesion]=0;
    requireUpdateScore(0,oldScore);
}

function setVisualizedByMainSegment(Value)
{
    meVisualizedByMainSegment[meCurrentLesion]=Value;
}

function setVisualizedByMainSegment(Value)
{
    meVisualizedByMainSegment[meCurrentLesion]=Value;
}

function setVisualizedByContrast(Value)
{
    var OldScore=meVisualizedByContrastScore[meCurrentLesion];
    var proxSegment=GetProximalSegmentNumber();
    var blnFirstSet=false;
    var blnFirstOption=false;
    var blnSecondOption=false;
    var newScore = -1;
    var arrayStart=0;
    var	arrayEnd=0;
    var showme;
    var number;
    var showme2;
    var label;
    var segm='';
    var tmpteststring;
    var denylist='';
    meSegments[meCurrentLesion]=Value;
    var activeSegment=meSegments[meCurrentLesion];

    for (var i = 0; i < meSegmentVisualizedTableHelp.length; i++)
    {
	showme=meSegmentVisualizedTableHelp[i][4];
	segm=meSegmentVisualizedTableHelp[i][0];
	denylist=parent.meSegmentVisualizedTableHelp[i][5];

	if (segm==meVisualizedByMainSegment[meCurrentLesion])
	{
	    // FOUND CORRECT SEGMENT
	    arrayStart=parseInt(meSegmentVisualizedTableHelp[i][2]);
	    arrayEnd=parseInt(meSegmentVisualizedTableHelp[i][3]);
	    break;
	}
    }

    if (showme=='1')
    {

	for (var j = arrayStart;j <= arrayEnd; j++)
	{
	    number=meDiffuseTableArray[j][1];
	    showme2=meDiffuseTableArray[j][2];

	    if ((showme2=='1') && (denylist!=''))
	    {
		//check if not in deny list
		tmpteststring='|' + number + '|';
		if (denylist.indexOf(tmpteststring)!=-1)
		{
		    showme2='0';
		}
	    }

	    if (showme2=='1')
	    {
		// adaption 2011-03-13. Special case for T.O. 5
		if( proxSegment == '5' ) {
		    newScore=calculateQ4V_TO5(activeSegment);
		    break;
		}
					if ( activeSegment == 16 && number == 1 ) {
					newScore = 2;
					break;
				}
					if ( activeSegment == "none" && number == 1 && meDominance == 'right') {
					newScore = 3;
					break;
				}
					if ( activeSegment == 4 && number == 1 ) {
					newScore = 2;
					break;
				}				
					if ( activeSegment == "none" && number == 2 && meDominance == 'right') {
					newScore = 2;
					break;
				}
					if ( activeSegment == 16 && number == 2 ) {
					newScore = 1;
					break;
				}
					if ( activeSegment == 4 && number == 2 ) {
					newScore = 1;
					break;
				}								
					if ( activeSegment == 16 && number == 3 ) {
					newScore = 0;
					break;
				}
					if ( activeSegment == "none" && number == 3 ) {
					newScore = 1;
					break;
				}				
					if ( activeSegment == 16 && number == 4 ) {
					newScore = 0;
					break;
				}				
					if ( activeSegment == 4 && number == 4 ) {
					newScore = 0;
					break;
				}
					if ( activeSegment == "none" && number == 4 ) {
					newScore = 0;
					break;
				}	
		else {
		    // adaption, start assigning points AFTER activeSegment + 1
		    if ( number != activeSegment ) {
			newScore=newScore+1;
		    }
		    else {
			break;
		    }
		}
	    }
	}
    }

    // newScore has been initialized at -1 because we do not
    // want to assign point to the segment after 
    if( newScore == -1 )
	newScore = 0;

    meVisualizedByContrastScore[meCurrentLesion]=newScore;

    UpdateScore(newScore);
    UpdateScore(-(OldScore));
    showScore();
}

function calculateQ4V_TO5(activeSegment){
    var score = 0;

    if( meDominance == 'left' ){
	switch( activeSegment ) {
	  case "7"    : score=1; break;
	  case "8"    : score=2; break;
	  case "13"   : score=1; break;
	  case "14"   : score=2; break;
	  case "15"   : score=3; break;
          case "none" : score=4; break;
	  default     : score=0;
	}
    }
    else {
	switch( activeSegment ) {
	  case "7"    : score=1; break;
	  case "8"    : score=2; break;
	  case "13"   : score=1; break;
	  case "14"   : score=2; break;
          case "none" : score=3; break;
	  default     : score=0;
	}
    }
    
    return score;
}


function setSideBranch(Value)
{
    // 2 = 0
    meSideBranch[meCurrentLesion]=Value;
    var oldScore=meSideBranchScore[meCurrentLesion];
    var newScore=0;

    if ((Value==1) || (Value==3) || (Value==2))
    {
	newScore=1;
    }
    requireUpdateScore(newScore,oldScore);
    meSideBranchScore[meCurrentLesion]=newScore;
}

function SetTrifurcation(Value)
{

    meTrifurcation[meCurrentLesion]=Value;
    var oldScore=meTrifurcationScore[meCurrentLesion];
    var newScore=0;

    if ((Value!=0) && (Value!=-1))
    {
	newScore=(Value)+2;
    }
    requireUpdateScore(newScore,oldScore);
    meTrifurcationScore[meCurrentLesion]=newScore;

}

function SetBifurcation(Value)
{
    var oldValue=meBifurcation[meCurrentLesion];
    var newValue=Value;
    meBifurcation[meCurrentLesion]=Value;
    var str1score='-ABC';
    var str2score='-DEFG';


    var oldScore=meBifurcationScore[meCurrentLesion];
    var newScore=0;


    if (oldValue!=newValue)
    {
	//A B C
	//D E F G
	if (str1score.indexOf(newValue)>0)
	{
	    newScore=1;
	}

	if (str2score.indexOf(newValue)>0)
	{
	    newScore=2;
	}
    }
    requireUpdateScore(newScore,oldScore);
    meBifurcationScore[meCurrentLesion]=newScore;

}

function SetBifurcationAngulation(Value)
{
    meBifurcationAngulation[meCurrentLesion]=Value;
    var oldScore=meBifurcationAngulationScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=1;
    }
    requireUpdateScore(newScore,oldScore);
    meBifurcationAngulationScore[meCurrentLesion]=newScore;
}

function SetAortaOstialLesion(Value)
{
    meAortoOstialLesion[meCurrentLesion]=Value;
    var oldScore=meAortoOstialLesionScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=1;
    }
    requireUpdateScore(newScore,oldScore);
    meAortoOstialLesionScore[meCurrentLesion]=newScore;
}

function SetSevereTorTuosity(Value)
{
    meSevereTortuosity[meCurrentLesion]=Value;
    var oldScore=meSevereTortuosityScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=2;
    }
    requireUpdateScore(newScore,oldScore);
    meSevereTortuosityScore[meCurrentLesion]=newScore;
}

function SetLength(Value)
{
    meLength[meCurrentLesion]=Value;
    var oldScore=meLengthScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=1;
    }
    requireUpdateScore(newScore,oldScore);
    meLengthScore[meCurrentLesion]=newScore;
}

function SetHeavycalcification(Value)
{
    meHeavyCalcification[meCurrentLesion]=Value;
    var oldScore=meHeavyCalcificationScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=2;
    }
    requireUpdateScore(newScore,oldScore);
    meHeavyCalcificationScore[meCurrentLesion]=newScore;
}

function SetThrombus(Value)
{
    meThrombus[meCurrentLesion]=Value;
    var oldScore=meThrombusScore[meCurrentLesion];
    var newScore=0;

    if (Value==1)
    {
	newScore=1;
    }
    requireUpdateScore(newScore,oldScore);
    meThrombusScore[meCurrentLesion]=newScore;
}

function SetComment(Comment)
{
    meComment[meCurrentLesion]=Comment;
}

function getForcedTrifurcationAnswer()
{
    //adjusted always show Q5Yes options

    return false;
    //find out if for this lession a certain combination is true
    //if so the answer is forced!!
    if (parseInt(meSegmentsInvolved[2][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[3][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[4][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[5][meCurrentLesion])==1)
    {
	return true;
    }
    if (parseInt(meSegmentsInvolved[8][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[9][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[16][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[17][meCurrentLesion])==1)
    {
	return true;
    }
    if (parseInt(meSegmentsInvolved[9][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[10][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[12][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[13][meCurrentLesion])==1)
    {
	return true;
    }
    if (parseInt(meSegmentsInvolved[10][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[11][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[14][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[15][meCurrentLesion])==1)
    {
	return true;
    }
    if (parseInt(meSegmentsInvolved[16][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[18][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[19][meCurrentLesion])==1 && parseInt(meSegmentsInvolved[20][meCurrentLesion])==1)
    {
	return true;
    }

    return false;
}


function UpdateScore(ScoreToAdd)
{
    meScore=meScore+parseFloat(ScoreToAdd);
    meScorePerLesion[meCurrentLesion] = meScorePerLesion[meCurrentLesion] + parseFloat(ScoreToAdd);
}

function GetScore()
{
    return meScore;
}

/**
   Function increments the meCurrentLesion variable and
   prepares everything for the next lesion.

   Because this function will no longer handle the navigation
   to the ScoreOverview (when the user is finished) this
   functionality has been taken out.
 */
function NextLesion()
{
    if( meNumberOfLesions + 1 <= 12 ) {
	meNumberOfLesions++;
	meCurrentLesion = meNumberOfLesions-1;

	setFrameUrl('left','empty.htm');
	setFrameUrl('right','empty.htm');

	if( meDominance == 'left' )
	    setFrameUrl('left','selectedleft.htm');
	else
	    setFrameUrl('left','selectedright.htm');

	setFrameUrl('right','lesion_segments.htm');

	// header update
	UpdateCurrentLesion();
    }
    else {
	alert("Maximum number of lesions is 12");
	return;
    }
}

/** Function is invoked when the user decided to
    stop entering the lesions and the score will be
    calculated. ( code taken from NextLesion() )
 */
function navigateToScoreOverview(){
    ApplicationEnded=true;
    gotoScoreOverview();
}

/** Header text change */
function UpdateCurrentLesion()
{
    parent.setHeaderText('current','Current lesion: ' + (meCurrentLesion+1) + '/' + meNumberOfLesions);
}

/** Function is only invoked in case of a 'new patient', so at the load of frameset.htm
    and the dominance is to be selected (left of right)
 **/
function init()
{
    //initalize the application
    meDominance='';
    reset();
    setFrameUrl('header','header.htm');
    setFrameUrl('left','selectdomleft.htm');
    setFrameUrl('right','selectdomright.htm');

    blnInitCalled=true;
}

/** Function is only invoked in case of a 'new patient', so at the load of frameset.htm
    and the dominance is to be selected (left of right)
 **/
function initSS2()
{
    //initalize the application
    meDominance='';
    reset();

    // this will result in an ignoring SS1
    ss2Runs = 2;
    setFrameUrl('header','header.htm');
    gotoSyntaxScore2();
    
    blnInitCalled=true;
}

function gotoScoreOverview()
{
    parent.setHeaderText('current','&nbsp;');
    parent.setHeaderText('dominance','&nbsp;');

    setFrameUrl('left','scorecontent.htm');
    setFrameUrl('right','scoreoverview.htm');
}


function gotoSyntaxScore2()
{
    parent.setHeaderText('current','&nbsp;');
    parent.setHeaderText('dominance','&nbsp;');

    setFrameUrl('left','syntaxscore2leftside.htm');
    setFrameUrl('right','syntaxscore2rightside.htm');

    ss2Runs = ss2Runs + 1;

    if( ss2Runs > 1 ){
	meScore = 0;
	hideScore();
    }
}

function requireUpdateScore(newScore,oldScore)
{
    if (newScore!=oldScore)
    {
	UpdateScore(-(oldScore));
	UpdateScore(newScore);
	showScore();
    }
}


var blnPrintRequested = false;
var blnSaveRequested = false;

/**
 * Function is called by onLoad method of scoreoverview.htm
 * The onLoad event is executed AFTER the table has been
 * calculated (html loaded) and therefore we can print
 * safely (page is updated with new patient date).
 */
function PrintScoreIfNeeded() {
  if( blnPrintRequested ){
    window.frames['right'].PrintScore();
  }
  blnPrintRequested = false;
}

function PrintScore()
{

  // this function update blnCalculationDone when it is finished
  setFrameUrl('right', 'scoreoverview.htm');

  // check if calculation finished
  while( !blnCalculationDone ) {
    // if not wait
    setTimeout(';', 1000);
  }

  // calculation finished we can print
  window.frames['right'].PrintScore();
}

function DetectBrowser()
{
    var val = navigator.userAgent.toLowerCase();       

    if(val.indexOf("firefox") > -1)
    {
	return "firefox"
    } 

    else if(val.indexOf("opera") > -1)
    {
        return "opera";
    }

    else if(val.indexOf("msie") > -1)
    {
        return "ie"
    }
    else if(val.indexOf("safari") > -1)
    {
        return "safari";
    }
}

function genHead() {

    var printOverViewHead = '';

    printOverViewHead = '<table class="sotable" id="allanswertable" width=100%><tr><td width=30%></td><td width=70%></td></tr>';
    if( parent.getById('left', 'patientId').value != "" ) {
	printOverViewHead += '<tr><td> Patient ID: </td><td>' +  parent.getById('left', 'patientId').value + '</td></tr>';
    }
    else {
	printOverViewHead += '<tr><td> Patient ID: </td><td>...................................</td></tr>';
    }

    if( parent.getById('left', 'patientName').value != "" ) {
	printOverViewHead += '<tr><td> Name : </td><td>' +  parent.getById('left', 'patientName').value + '</td></tr>';
    }
    else {
	printOverViewHead += '<tr><td> Name : </td><td>...................................</td></tr>';
    }

    if( parent.getById('left', 'patientDob').value != "" ) {
	printOverViewHead += '<tr><td> Date of birth: </td><td>' +  parent.getById('left', 'patientDob').value + '</td></tr>';
    }
    else {
	printOverViewHead += '<tr><td> Date of birth: </td><td>...................................</td></tr>';
    }		
    printOverViewHead += '</table>';

    return printOverViewHead;
}

function GeneratePdfIfNeeded() {
    if( blnSaveRequested ) {
	blnSaveRequested = false;

	var saveText = genHead() + parent.getFrame('left').document.genPdfForm.printsource.value;
	alert(genHead());
	parent.getFrame('left').document.genPdfForm.printsource.value = saveText;

	getFrame('left').document.genPdfForm.submit();
    }
    else {
	blnSaveRequested = false;
	return false;
    }
}

/** Function sets the currentLesion to completed. This function
    is invoked after the form is completed and the next
    button (in form.htm) is clicked.
 **/
function setLesionAsCompleted() {
    meCompletedLesions[meCurrentLesion] = 1;
}

function resetMeCompletedLesions() {
    for( var i = 0; i < myDefaultArrayLength; i++ ) {
	meCompletedLesions[i] = 0;
    }
}

function setFormVarBlnSegmentTableContainsElements(lesionNumber) {
  formVarBlnSegmentTableContainsElements[lesionNumber] = 1;
}
