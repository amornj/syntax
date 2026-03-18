<!--

/******************************************************
 * Syntax Score Calculator Version 2.2                *
 *                                                    *
 * Orginal code (version 1.0): ISM (2005)             *
 * Adaptations  (version 2.0): MvG Creative (2009)    *
 ******************************************************/

/*
 * Version 2.0: Changes to this file.
 *
 * - Some minor changes in the logic, for example to
 *   skip question 9 in case of a positive answer in
 *   question 4.
 *
 * - All global variables have been moved to the
 *   'parent' frameset.js and are saved per lesion, to
 *   not loose this information on reload/edit of a
 *   lesion.
 *
 * - Question 12 is taken out and moved to its own
 *   question12.js, because it is presented once after
 *   all lesions have been completed.
 */

if (parent.ApplicationEnded)
{
    //no back allowed when application has ended
    parent.gotoScoreOverview();
}

if (parent.meCurrentLesion<parent.meNumberOfLesions)
{}
else
{
    //force score overview
    parent.gotoScoreOverview();
}

// the saved boolean has to be set to false on (re)load
parent.formVarBlnSaved[parent.meCurrentLesion] = false;

function resetQuestion(QNR,QSUB)
{
    if (QNR==4)
    {
	//0 alle 4x formulieren uit
	//1 alle 4x formulieren uit behalve 1
	if (QSUB==0)
	{
	    //page refresh!!
	    parent.resetTotalOcclusionScore();

	}

	if (QSUB<1)
	{
	    if (isVisible('q4i'))
	    {
		resetForm('formq4i');
		ShowItem('q4i',false);
	    }

	    parent.SetProximalSegmentNumber('');
	    parent.formVarBlnSegmentVisualizedVisual[parent.meCurrentLesion]=false;

	}

	if (QSUB<2)
	{
	    parent.SetAgeOfTO(-1);

	    if (isVisible('q4ii'))
	    {
		resetForm('formq4ii');
		ShowItem('q4ii',false);
	    }
	}

	if (QSUB<3)
	{
	    parent.SetBluntStump(-1);
	    if (isVisible('q4iii'))
	    {
		resetForm('formq4iii');
		ShowItem('q4iii',false);
	    }
	}

	if (QSUB<4)
	{
	    parent.setBridging(-1);
	    if (isVisible('q4iv'))
	    {
		resetForm('formq4iv');
		ShowItem('q4iv',false);
	    }
	}

	if (QSUB<5)
	{
	    HideAllSegmentTables();
	    parent.setVisualizedByContrast('Skipped');
	    parent.resetVisualizedByContrastScore();
	    if (isVisible('q4v'))
	    {
		resetForm('formq4v');
		ShowItem('q4v',false);
	    }
	}

	if (QSUB<6)
	{
	    parent.formVarBlnSkip5[parent.meCurrentLesion] = false;
	    parent.formVarBlnSkip6 [parent.meCurrentLesion] = false;
	    parent.formVarBlnSkip7[parent.meCurrentLesion] = false;
	    parent.setSideBranch(-1);
	    if (isVisible('q4vi'))
	    {
		resetForm('formq4vi');
		ShowItem('q4vi',false);
	    }
	}
    }

    if (QNR<5)
    {
	parent.formVarBlnSkip6by5[parent.meCurrentLesion] = false;
	parent.SetTrifurcation(-1);
	if (isVisible('q5'))
	{
	    resetForm('formq5');
	    ShowItem('q5',false);
	}
	if (isVisible('q5yes'))
	{
	    resetForm('formq5yes');
	    ShowItem('q5yes',false);
	}
    }
    /* Ray */
    if (QNR==6)
    {

	if (QSUB<1)
	{
	    parent.SetBifurcationAngulation(-1);
	    if (isVisible('q6yes1'))
	    {
		resetForm('formq6yes2');
	    }
	}
	if (QSUB<2)
	{
	    parent.SetBifurcationAngulation(-1);
	    if (isVisible('q6yes2'))
	    {
		resetForm('formq6yes2');
		ShowItem('q6yes2',false);
	    }
	}
    }
    /* End - Ray */
    if (QNR<6)
    {
	parent.SetBifurcation('');
	parent.SetBifurcationAngulation(-1);
	if (isVisible('q6'))
	{
	    resetForm('formq6');
	    ShowItem('q6',false)
		}
	if (isVisible('q6yes1'))
	{
	    resetForm('formq6yes1');
	    ShowItem('q6yes1',false);
	}
	if (isVisible('q6yes2'))
	{
	    resetForm('formq6yes2');
	    ShowItem('q6yes2',false);
	}
    }

    if (QNR<7)
    {
	parent.SetAortaOstialLesion(-1);
	if (isVisible('q7'))
	{
	    resetForm('formq7');
	    ShowItem('q7',false);
	}
    }

    if (QNR<8)
    {
	parent.SetSevereTorTuosity(-1);
	if (isVisible('q8'))
	{
	    resetForm('formq8');
	    ShowItem('q8',false);
	}
    }

    if (QNR<9)
    {
	parent.SetLength(-1);
	if (isVisible('q9'))
	{
	    resetForm('formq9');
	    ShowItem('q9',false);
	}
    }

    if (QNR<10)
    {
	parent.SetHeavycalcification(-1);
	if (isVisible('q10'))
	{
	    resetForm('formq10');
	    ShowItem('q10',false);
	}
    }

    if (QNR<11)
    {
	parent.SetThrombus(-1);
	if (isVisible('q11'))
	{
	    resetForm('formq11');
	    ShowItem('q11',false);
	}
    }

    if (QNR<12)
    {
	parent.resetVesselScores();
	parent.formVarDiffuseDiseaseScore[parent.meCurrentLesion]=0;

	if (isVisible('q12'))
	{
	    resetForm('formq12');
	    ShowItem('q12',false);
	}

	if (isVisible('q12yes'))
	{
	    resetForm('formq12yes');
	    ShowItem('q12yes',false);
	}



	if (isVisible('comment'))
	{
	    resetForm('formcomment');
	    ShowItem('comment',false);
	    ShowItem('savebutton',false);
	}
    }

    //reset Q12 yes
    if ((QNR==12) && (QSUB==1) && (isVisible('q12yes')))
    {
	resetForm('formq12yes');
	ShowItem('q12yes',false);
	parent.resetVesselScores();
	parent.formVarDiffuseDiseaseScore[parent.meCurrentLesion]=0;
    }

    //reset hide of this frame
    ShowItem('formmaintable',false);
    ShowItem('formmaintable',true);
}

function buildSegmentTable( )
//dynamic table
{
    var debug = '';
    var label='';
    var number='';
    var showme='0';
    var currentLession=parent.meCurrentLesion;

    for (var i = 0; i < parent.meDiffuseTableArray.length; i++)
    {
      label=parent.meDiffuseTableArray[i][0];
      if (label=='') {
	label='&nbsp;';
      };

      number=parent.meDiffuseTableArray[i][1];
      showme=parent.meDiffuseTableArray[i][2];

      if ((showme=='1') && (parent.meSegmentsInvolved[i][currentLession]==1))
      {
	//parent.formVarBlnSegmentTableContainsElements[parent.meCurrentLesion]=true;
         parent.setFormVarBlnSegmentTableContainsElements(parent.meCurrentLesion);

	if (parent.formVarIDSegmentTableFirstVisible[parent.meCurrentLesion] == '' )
	{
	  parent.formVarIDSegmentTableFirstVisible[parent.meCurrentLesion]= 'dd' + i;
	}

	parent.formVarIDSegmentTableLastVisible[parent.meCurrentLesion]='dd'+i;
	
	document.write('<tr><td style="width:50px; padding-left: 5px;">' + parent.meDiffuseTableArray1stColumn[i] + '</td><td style="width:100px;text-align:center;">');
	document.write(label);
	document.write('</td><td style="width:100px;text-align:center;">');
	document.write(number);
	document.write('</td><td style="width:200px;text-align:center;">'
		       + '<input type="radio" ID="dd'+i+'" VALUE="' + i
		       + '" NAME="mostproxseg" onClick="Question4I(' + i + ',this);"></td></tr>');

	/** DEBUG
	 debug += '<tr><td style="width:100px;text-align:center;">' + label;
	 debug += '</td><td style="width:100px;text-align:center;">' + number;
	 debug += '</td><td style="width:200px;text-align:center;"><input type="checkbox" ID="dd'+i+'" VALUE="'+i+'" NAME="mostproxseg" onClick="Question4I('+i+',this)"></td></tr>';
	 **/
      }
    }

    //    alert( debug);
    /*
    if  (parent.formVarBlnSegmentTableContainsElements[parent.meCurrentLesion])
    {
      document.write('<tr><td colspan="3" class="buttontd"><input  type="submit" value="next" border="0" width="50" height="21" onClick="javascript:CheckQuestion4I();"></td></tr>');
    }
    */
}


function HideAllSegmentTables()
{
    var showme='0';
    var idLabel='';
    //header
    for (var i = 0; i < parent.meSegmentVisualizedTableHelp.length; i++)
    {
	showme=parent.meSegmentVisualizedTableHelp[i][4];

	if (showme=='1')
	{

	    idLabel='q4vitable'+parent.meSegmentVisualizedTableHelp[i][0];
	    ShowItem(idLabel,false);
	}
    }
}

function buildSegmentVisualizTableNew()
{
    var label='';
    var number='';
    var showme='0';
    var segment='0';
    var arrayStart;
    var arrayEnd;
    var showme2='0';
    var denylist='';
    var tmpteststring='';

    //header

    for (var i = 0; i < parent.meSegmentVisualizedTableHelp.length; i++)
    {
	segment=parent.meSegmentVisualizedTableHelp[i][0];
	showme=parent.meSegmentVisualizedTableHelp[i][4];
	label=parent.meSegmentVisualizedTableHelp[i][1];
	arrayStart=parseInt(parent.meSegmentVisualizedTableHelp[i][2]);
	arrayEnd=parseInt(parent.meSegmentVisualizedTableHelp[i][3]);
	denylist=parent.meSegmentVisualizedTableHelp[i][5];

	if (showme=='1')
	{
	    nrOfItems=0;

	    document.write('<TABLE border="0" cellpadding="0" cellspacing="0" class="selecttable" ID="q4vitable'+parent.meSegmentVisualizedTableHelp[i][0]+'" style="display:none; margin-top:5px;">');
	    document.write('<tr id="psnheader" ><td style="width:140px;text-align:center;">&nbsp;</td><td style="width:100px;text-align:center;">Segment<br>numbers:</td><td style="width:160px;text-align:center;">Segment<br>visualized by contrast:</td></tr>');

	    document.write('<tr id="psnnone"><td style="width:140px;text-align:center;">');
	    document.write('&nbsp;');
	    document.write('</td><td style="width:100px;text-align:center;">');
	    document.write('none');
	    document.write('</td><td style="width:160px;text-align:center;"><input type="radio" ID="ddsgmsnone'+segment+'" VALUE="none" NAME="firstseg" onClick="javascript:Question4SelectNone('+segment+');"></td></tr>');



	    for (var j = arrayStart;j <= arrayEnd; j++)
	    {
		number=parent.meDiffuseTableArray[j][1];
		showme2=parent.meDiffuseTableArray[j][2];

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
		    document.write('<tr id="psn'+i+'d'+j+'"><td style="width:140px;text-align:center;">');
		    document.write(label);
		    document.write('</td><td style="width:100px;text-align:center;">');
		    document.write(number);
		    document.write('</td><td style="width:160px;text-align:center;"><input type="radio" ID="ddsgms'+i+'d'+j+'" VALUE="'+i+j+'" NAME="firstseg" onClick="javascript:Question4V(' + String.fromCharCode(39) + number + String.fromCharCode(39) +','+segment+')"></td></tr>');
		    label='&nbsp;';
		}
	    }

	    document.write('</TABLE>');
	}
    }
}

function CorrectProxSegmentTable()
{
    parent.formVarBlnSegmentVisualizedVisual[parent.meCurrentLesion]=true;
    var mostProx=parent.getMostProximalSegmentNumber();
    var showme='0';

    for (var i = 0; i < parent.meSegmentVisualizedTableHelp.length; i++)
    {
	if (parent.meSegmentVisualizedTableHelp[i][0]==mostProx)
	{
	    showme=parent.meSegmentVisualizedTableHelp[i][4];
	}
    }


    if (showme=='1')
    {
	var labelTable='q4vitable'+mostProx;
	ShowItem(labelTable,true);
	ShowItem('q4vitable',false);
	ShowItem('q4vitable',true);
	return true;
    }
    else
    {
	return false;
    }
}

function setFocus(id1,id2)
{
    window.scroll(0,1200);
}

function resetForm(id)
{
    document.getElementById(id).reset();

}

function ShowItem(id,show)
{
    if (show)
    {
	document.getElementById(id).style.display='block';
    }
    else
    {
	document.getElementById(id).style.display='none';
    }

}


function isVisible(id)
{
    if (document.getElementById(id).style.display=='block')
    {
	return true
	    }
    return false
	}

function Question4SelectNone(segment)
{
    parent.setVisualizedByMainSegment(segment);
    parent.setVisualizedByContrast('none');
    ShowQuestion4VI();
}


function Question4(show,me)
{
    //set totalOccliion and reset form
    resetQuestion(4,0);
    parent.SetTotalOcclusion(me.value);

    if (show)
    {
	//YES
	if (parent.formVarBlnSegmentTableContainsElements[parent.meCurrentLesion])
	{
	    ShowItem('q4i',true);
	    setFocus(parent.formVarIDSegmentTableFirstVisible[parent.meCurrentLesion],parent.formVarIDSegmentTableLastVisible[parent.meCurrentLesion]);
	}
	else
	{
	    ShowQuestion4II();
	}
	//ShowItem('afterfour',false);
	//reset score for q5 and on!!!!
    }
    else
    {
	ShowQ5();
    }
}

function Question4I(number,me)
{
    resetQuestion(4,1);
    parent.resetTotalOcclusionScore();
    parent.SetIndicateSegmentNumber(number,me);
    ShowQuestion4II();
}

function ShowQuestion4II()
{
    ShowItem('q4ii',true);
    setFocus('q4iir1','q4iir3');
}

function Question4II(number)
{
    resetQuestion(4,2);

    parent.SetAgeOfTO(number);
    ShowItem('q4iii',true);
    setFocus('q4iiir1','q4iiir2');
    //reload left frame
    parent.setFrameUrl('left','diagramblunt.htm');
}

function Question4III(number)
{
    resetQuestion(4,3);
    parent.SetBluntStump(number);
    ShowItem('q4iv',true);
    setFocus('q4ivr1','q4ivr2');
    parent.setFrameUrl('left','diagrambridging.htm');
}

/* number = segment with contrast, segment = most proximal segment
 * of total occlusion
 */
function Question4V(number,segment)
{
    resetQuestion(4,5);
    parent.setVisualizedByMainSegment(segment);
    parent.setVisualizedByContrast(number);

    ShowQuestion4VI();
}

function Question4IV(number)
{
    resetQuestion(4,4);
    parent.setBridging(number);

    if ((parent.formVarBlnSegmentTableContainsElements[parent.meCurrentLesion]) && (CorrectProxSegmentTable()))
    {
	ShowItem('q4v',true);
	//CorrectProxSegmentTable();
	parent.setFrameUrl('left','overview.htm');
	setFocus('','');
    }
    else
    {
	Question4V('Skipped','-1');
    }


    //parent.setFrameUrl('left','overview.htm');
}

function Question4VI(number)
{
    resetQuestion(4,6);
    parent.setSideBranch(number);

    //skip questoon 6 and 7 if 2 is the answer on this question
    if ((number==0) || (number==1))
    {
	parent.formVarBlnSkip5[parent.meCurrentLesion] = true;
	parent.formVarBlnSkip6 [parent.meCurrentLesion] = true;
	//parent.formVarBlnSkip7[parent.meCurrentLesion] = true;
    }
    else
    {
	parent.formVarBlnSkip5[parent.meCurrentLesion] = false;
	parent.formVarBlnSkip6 [parent.meCurrentLesion] = false;
	//parent.formVarBlnSkip7[parent.meCurrentLesion] = false;
    }
    ShowQ5();
}

function ShowQuestion4VI()
{
    parent.setFrameUrl('left','diagramsidebranch.htm');
    ShowItem('q4vi',true);
    setFocus('q4vir1','q4vir3');
}


function Question5(number)
{
    resetQuestion(5,0);
    parent.SetTrifurcation(number);
    ShowQ6();

    //0 is nothing
    //1 i
    //2 ii
    //3 iii
    //4 iV
}

function ShowQ5Yes()
{
    resetQuestion(5,1);

    parent.formVarBlnSkip6by5[parent.meCurrentLesion] = true;

    //reset values!!!!! recalculate!!!
    resetForm('formq6');
    ShowItem('q6',false);
    resetForm('formq6yes1');
    ShowItem('q6yes1',false);
    resetForm('formq6yes2');
    ShowItem('q6yes2',false);

    var forcedanswer=parent.getForcedTrifurcationAnswer();

    if (forcedanswer)
    {
	//answer is 1
	Question5(1);
	//goto 6
	ShowQ6();

    }
    else
    {
	parent.setFrameUrl('left','overview.htm');

	ShowItem('q5yes',true);
	setFocus('q5r2y1','q5r2y4');
    }
}

function ShowQ5No()
{
    resetQuestion(5,1);
    parent.formVarBlnSkip6by5[parent.meCurrentLesion] = false;
    parent.setFrameUrl('left','overview.htm');
    resetForm('formq5yes');
    ShowItem('q5yes',false);
    Question5(0);


}


function ShowQ5()
{

    if (parent.formVarBlnSkip5[parent.meCurrentLesion])
    {
	ShowQ6();
    }
    else
    {
	resetQuestion(5,0);
	parent.setFrameUrl('left','overview.htm')
	    ShowItem('q5',true);
	setFocus('q5r1','q5r2');
    }

}

function ShowQ6()
{
    resetQuestion(6,0);
    if ((parent.formVarBlnSkip6 [parent.meCurrentLesion]) || (parent.formVarBlnSkip6by5[parent.meCurrentLesion]))
    {
	ShowQ7();
    }
    else
    {
	ShowItem('q6',true);
	setFocus('q6r1','q6r2');
    }
}

function Question6No()
{
    //hide
    resetQuestion(6,0);
    parent.SetBifurcation('');

    resetForm('formq6yes1');

    ShowItem('q6yes1',false);

    resetForm('formq6yes2');
    ShowItem('q6yes2',false);
    parent.setFrameUrl('left','overview.htm');

    ShowQ7();
}

function Question6Yes(part)
{
    resetQuestion(6,0);
    if (part=='1')
    {
	ShowItem('q6yes1',true);
	setFocus('q6r2yp1x1','q6r2yp1x7');
        parent.setFrameUrl('left','diagramabcdefg.htm');
    }

    if (part=='2')
    {
	parent.setFrameUrl('left','diagramangu.htm')
	ShowItem('q6yes2',true);
	setFocus('q6r2yp2x1','q6r2yp2x2');
    }
}

function Question6P1(Answerchar)
{
    resetQuestion(6,1);
    parent.SetBifurcation(Answerchar);
    Question6Yes('2');
}

function Question6P2(number)
{
    resetQuestion(6,2);
    parent.SetBifurcationAngulation(number);
    ShowQ7();
}

function ShowQ7()
{
    resetQuestion(7,0);
    parent.setFrameUrl('left','overview.htm');
    var blnEnabled=parent.Question7Enabled();

    if (parent.formVarBlnSkip7[parent.meCurrentLesion])
    {
	blnEnabled=false;
    }
    if (blnEnabled)
    {
	ShowItem('q7',true);
	setFocus('q7r1','q7r2');
    }
    else
    {
	Question7(0);
	resetForm('formq7');
	ShowItem('q7',false);
	//reset score //reset form //
	ShowQ8();
    }
}

function Question7(number)
{
    resetQuestion(7,0);
    parent.SetAortaOstialLesion(number);
    ShowQ8();
}

function ShowQ8()
{
    resetQuestion(8,0);
    ShowItem('q8',true);
    setFocus('q8r1','q8r2');
}

function Question8(number)
{
    resetQuestion(8,0);
    parent.SetSevereTorTuosity(number);
    ShowQ9();
}

function ShowQ9()
{
  if( parent.meTotalOcclusion[parent.meCurrentLesion] &&
      parent.meTotalOcclusion[parent.meCurrentLesion] > 0 ) {
      // skip q9 in case q4 was true, reset, do not assign anything
      // and go to 10
      resetQuestion(9,0);
      ShowQ10();
  }
  else {
      resetQuestion(9,0);
      ShowItem('q9',true);
      setFocus('q9r1','q9r2');
  }
}

function Question9(number)
{
    resetQuestion(9,0);
    parent.SetLength(number);
    ShowQ10();
}

function ShowQ10()
{
    resetQuestion(10,0);
    ShowItem('q10',true);
    setFocus('q10r1','q10r2');
}


function Question10(number)
{
    resetQuestion(10,0);
    parent.SetHeavycalcification(number);
    ShowQ11();
}

function ShowQ11()
{
    resetQuestion(11,0);
    ShowItem('q11',true);
    setFocus('q11r1','q11r2');
}

function Question11(number)
{
    resetQuestion(11,0);
    parent.SetThrombus(number);
    checkQ12();
}

function checkQ12()
{
    // disable question 12 here, because it will be
    // presented once all lesions have been filled
    // out.
    parent.formVarBlnQ12Enabled[parent.meCurrentLesion] = false;
    //FIND OUT IF Q12 to be shown or not and correct the table
    if (parent.formVarBlnQ12Enabled[parent.meCurrentLesion])
    {
	ShowItem('q12',true);
	setFocus('','');
    }
    else
    {
	ShowItem('comment',true);
	ShowItem('savebutton',true);
    }
    setFocus('','');
}

function Question12(number)
{
    //yes =1
    //no  = 0
    if (number=='1')
    {
	ShowItem('q12yes',true);

	resetForm('formcomment');
	if (isVisible('comment'))
	{
	    ShowItem('comment',false);
	    ShowItem('savebutton',false);
	}
    }
    else
    {
	resetQuestion(12,1);

	ShowItem('comment',true);
	ShowItem('savebutton',true);

    }
    setFocus('','');
}



function Save()
{
    //enabled save once (dblclick!!)

    if (parent.formVarBlnSaved[parent.meCurrentLesion])
    {}
    else
    {
	parent.formVarBlnSaved[parent.meCurrentLesion]=true;

	if ((parent.formVarBlnSkip6 [parent.meCurrentLesion]) || (parent.formVarBlnSkip6by5[parent.meCurrentLesion]))
	{
	    parent.setQ6Skipped(true);
	}
	else
	{
	    parent.setQ6Skipped(false);
	}


	var blnEnabled=parent.Question7Enabled();

	if (parent.formVarBlnSkip7[parent.meCurrentLesion])
	{
	    blnEnabled=false;
	}

	if (blnEnabled)
	{
	    parent.setQ7Skipped(false);
	}
	else
	{
	    parent.setQ7Skipped(true);
	}

	//read comment
	parent.SetComment(document.getElementById('thecomment').value);

	// set current lesion as completed
	parent.meCompletedLesions[parent.meCurrentLesion] = 1;

	// and navigate to menu
	parent.setFrameUrl('left', 'overview.htm');
	parent.setFrameUrl('right','menu.htm');
    }
}



function buildDiffuseSegmentTable()
//dynamic table
{
    parent.formVarBlnQ12Enabled[parent.meCurrentLesion]=false;

    if (parent.blnInitCalled)
    {
	var iStart;
	var iEnd;

	if (parent.showVessel(1))
	{
	    buildDiffuseSegmentTableRows(0,7);
	}
	if (parent.showVessel(2))
	{
	    buildDiffuseSegmentTableRows(8,8);
	}
	if (parent.showVessel(3))
	{
	    buildDiffuseSegmentTableRows(9,15);
	}
	if (parent.showVessel(4))
	{
	    buildDiffuseSegmentTableRows(16,24);
	}
    }
}

function setDiffuseDisease(arraynumber,me)
{
    parent.setDiffuseDisease(arraynumber,me);

    var newValue=-1;
    if (me.checked)
    {
	newValue=1;
    }

    parent.formVarDiffuseDiseaseScore[parent.meCurrentLesion]=parent.formVarDiffuseDiseaseScore[parent.meCurrentLesion]+newValue;

}

function saveDiffuseSegment()
{
    if (parent.formVarDiffuseDiseaseScore[parent.meCurrentLesion]!=0)
    {
	//show comment
	ShowItem('comment',true);
	ShowItem('savebutton',true);
	setFocus('','');

    }
    else
    {
	alert('Select at least one segment');
    }
}

function buildDiffuseSegmentTableRows(iStart,iEnd)
{
    var label='';
    var number='';
    var showme='0';


    for (var i = iStart; i <=iEnd; i++)
    {
	label=parent.meDiffuseTableArray[i][0];
	if (label=='') {label='&nbsp;'};
	number=parent.meDiffuseTableArray[i][1];
	showme=parent.meDiffuseTableArray[i][2];
	if (showme=='1')
	{
	    parent.formVarBlnQ12Enabled[parent.meCurrentLesion]=true;
	    document.write('<tr><td style="width:100px;text-align:center;">');
	    document.write(label);
	    document.write('</td><td style="width:100px;text-align:center;">');
	    document.write(number);
	    document.write('</td><td style="width:200px;text-align:center;"><input type="checkbox" ID="dd'+i+'" VALUE="1" NAME="dd'+i+'" onClick="setDiffuseDisease('+i+',this)"></td></tr>');
	}
    }
}

//-->

