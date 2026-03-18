/******************************************************
 * Syntax Score Calculator Version 2.2                *
 *                                                    *
 * Syntax Score II (inc. in 2.2): MvG Creative (2013) *
 ******************************************************/

var FRAME_LAYOUT = true;

// Declaring the covariance/variance matrix using Sylvester Javascript matrix library
var matrix_T = 
$M([
[4.7974789000000, -0.0022691742000, -0.0412830750000, -0.0142098030000, -0.0157607790000, 0.0164216910000, -0.1322081600000, -0.0297472900000, -0.0724848320000],
[-0.0022691742000, 0.0001755837300, -0.0000398184210, -0.0000038640218, 0.0000102745950, -0.0004595223300, -0.0004221792200, -0.0001866830600, -0.0002317636300],
[-0.0412830750000, -0.0000398184210, 0.0005058653700, 0.0001318949600, -0.0000421320290, -0.0004911125000, 0.0003503229800, -0.0000404428970, 0.0001878566500],
[-0.0142098030000, -0.0000038640218, 0.0001318949600, 0.0001125569900, -0.0000437744760, -0.0000962177520, -0.0006560432700, 0.0000695365610, 0.0004395860700],
[-0.0157607790000, 0.0000102745950, -0.0000421320290, -0.0000437744760, 0.0004418016100, -0.0002319316200, 0.0010977041000, 0.0001489606400, 0.0002052775800],
[0.0164216910000, -0.0004595223300, -0.0004911125000, -0.0000962177520, -0.0002319316200, 0.0993969360000, 0.0074237030000, 0.0057716330000, -0.0039146463000],
[-0.1322081600000, -0.0004221792200, 0.0003503229800, -0.0006560432700, 0.0010977041000, 0.0074237030000, 0.1462399900000, -0.0021780574000, -0.0018524115000],
[-0.0297472900000, -0.0001866830600, -0.0000404428970, 0.0000695365610, 0.0001489606400, 0.0057716330000, -0.0021780574000, 0.1720792500000, -0.0184643010000],
[-0.0724848320000, -0.0002317636300, 0.0001878566500, 0.0004395860700, 0.0002052775800, -0.0039146463000, -0.0018524115000, -0.0184643010000, 0.1318248300000]]);

var cum_haz = 0.075349171;

// This is a vector
var gamma_PCI =
$V([
5.9363531000000,
0.0239369855000,
0.0255030450000,
-0.0203536122000,
-0.0578258800000,
-0.2015715800000,
-0.5314724800000,
0.3023548900000,
1.0269338356630
]);

var gamma_CABG =
$V([
5.936353100000,
-0.003465218500,
0.063047153000,
-0.009266941200,
-0.017106187000,
0.386125340000,
0.521747420000,
1.042834200000,
1.026892800000
]);

var nomogram_intercept = -2.5885388;
var nomogram_slope = 0.084062871;

// step 2 - declaration
var z_PCI;
var z_CABG;
var z_delta;
var se_delta;

// step 3 - declaration
var lp_CABG;
var lp_center = 3.4210909;
var lp_delta;
var lp_PCI;

// step 4 declaration (result)
var ss2_PCI;
var ss2_CABG;
var M_CABG;
var M_PCI;
var p_value;

// calculator switch var
var calcVisible = false;

/** This function fethces frame frameId in case of a frame
    layout. In case a div layout is used it returns the
    handle to the requested DIV 'frame'.
 **/
function getFrame( frameId ) {
    if( FRAME_LAYOUT ) {
	return parent.window.frames[frameId];
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

function getElementInForm(frameId, formId, id) {
    if( FRAME_LAYOUT ) {
	return getFrame(frameId).document.forms[formId][id];
    }
    else {
	alert("Div layout not yet implemented");
	return;
    }
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

function ShowItemCalc(id,show)
{
    if (show)
    {
	document.getElementById(id).style.display='';
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

// return the value of the radio button that is checked
// return an empty string if none are checked, or
// there are no radio buttons
function getCheckedValue(radioObj) {
    if(!radioObj)
	return "";

    var radioLength = radioObj.length;
    if(radioLength == undefined)
	if(radioObj.checked)
	    return radioObj.value;
    else
	return "";

    for(var i = 0; i < radioLength; i++) {
	if(radioObj[i].checked) {
	    return radioObj[i].value;
	}
    }
    return "";
}

function isLeftMainSelectedInOneOfTheLesions(){
    
    for (var i = 0; i <= 12; i++)
    {
	if( parent.meSegmentsInvolved[8][i] > 0 ) {
	    return true;
	}
    }
    return false;
}

function initSS2() {
    if( parent.ss2Runs <= 1 ) {
	getElementInForm('right', 'syntaxScore2Form', 'ss2SyntaxScore1').value = parent.meScore;
	getElementInForm('right', 'syntaxScore2Form', 'ss2SyntaxScore1').disabled = true;

	if( isLeftMainSelectedInOneOfTheLesions() ) {
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainYes').checked = true; 
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainNo').checked = false;
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainYes').disabled = true;
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainNo').disabled = true;
	}
	else {
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainYes').checked = false; 
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainNo').checked = true;
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainYes').disabled = true; 
	    getElementInForm('right', 'syntaxScore2Form', 'leftMainNo').disabled = true;
	}
    } 
    // hide calc by default
    calcVisible = false;

    parent.meScore2PCI  = null;
    parent.meScore2CABG = null;

    /** tmp init - REMOVE!
    getElementInForm('right', 'syntaxScore2Form', 'ss2SyntaxScore1').value = 42;
    getElementInForm('right', 'syntaxScore2Form', 'age').value = 61;
    getElementInForm('right', 'syntaxScore2Form', 'crcl').value = 90;
    getElementInForm('right', 'syntaxScore2Form', 'lvef').value = 30;
    getElementInForm('right', 'syntaxScore2Form', 'leftMainYes').checked = true;
    getElementInForm('right', 'syntaxScore2Form', 'leftMainNo').checked = false;
    getElementInForm('right', 'syntaxScore2Form', 'genderMale').checked = false;
    getElementInForm('right', 'syntaxScore2Form', 'genderFemale').checked = true;
    getElementInForm('right', 'syntaxScore2Form', 'copdYes').checked = false;
    getElementInForm('right', 'syntaxScore2Form', 'copdNo').checked = true;
    getElementInForm('right', 'syntaxScore2Form', 'pvdYes').checked = false;
    getElementInForm('right', 'syntaxScore2Form', 'pvdNo').checked = true;
    **/
    
}

function isValidSs2SyntaxScore1(syntaxScore1){
   return isValidFloatIntRange(syntaxScore1, 0, 120);
}

function isValidSs2Age(age){

    if( parseInt(age) == age ) {
	if( age >= 18 && age <= 100 ) {
	    return true;
	}
    }

    return false;
}

function getType(input) {
    var m = (/[\d]+(\.[\d]+)?/).exec(input);
    if (m) {
       // Check if there is a decimal place
       if (m[1]) { 
	   return 'float';
       }
       else { 
	   return 'int'; 
       }          
    }
    return 'string';
}

function isNumber(value) {
    if ((undefined === value) || (null === value)) {
        return false;
    }
    if (typeof value == 'number') {
        return true;
    }
    return !isNaN(value - 0);
}

function isValidFloatIntRange(str, min, max){

    if( isNumber(str) ) {
	if( parseFloat(str) >= min && parseFloat(str) <= max ) {
	    return true;
	}
    }

    return false;
}

// check if int or float between 0 - 135
function isValidSs2Crcl(str, unity){

    if( calcVisible ) {
	return isValidFloatIntRange(str, -10000000, 10000000);
    }
    else {
	if( unity == 'mlmin' ) {
	    return isValidFloatIntRange(str, 0, 135);
	}
	else {
	    // Not yet confirmed min, max values required
	    return isValidFloatIntRange(str, 0, 135);	
	}
    }
}

// check if int or float between 10 - 75
function isValidSs2Lvef(str){

    return isValidFloatIntRange(str, 10, 99);
}

function resetValidation() {
    ShowItem("ss2ValidationSs1Score", false);
    ShowItem("ss2ValidationAge", false);
    ShowItem("ss2ValidationCrcl", false);
    ShowItem("ss2ValidationLvef", false);
    ShowItem("ss2ValidationLeftMain", false);
    ShowItem("ss2ValidationGender", false);
    ShowItem("ss2ValidationCopd", false);
    ShowItem("ss2ValidationPvd", false);
    ShowItem("ss2ValidationError", false);  
    ShowItem("ss2ValidationCrclCalc", false);
}

function ss2QuestionsValid(){
    
    var ss2Syntaxscore1 = getElementInForm('right', 'syntaxScore2Form', 'ss2SyntaxScore1').value;
    var age = getElementInForm('right', 'syntaxScore2Form', 'age').value;
    var gender = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'gender'));
    var crclUnity = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'crclUnity'));
    var crcl = getCrcl(age, gender, crclUnity);
    var lvef = getElementInForm('right', 'syntaxScore2Form', 'lvef').value;
    var lms = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'leftMain'));
    var copd = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'copd'));
    var pvd = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'pvd'));

    var nrOfErrors = 0;
    var errorMessage = "<p> <b>The given input values are not valid. Please correct the questions with the red annotations below. </b><ul>";

    resetValidation();

    if( ! isValidSs2SyntaxScore1(ss2Syntaxscore1) ) {	
	ShowItem("ss2ValidationSs1Score", true);
	nrOfErrors++;
    }
    if( ! isValidSs2Age(age) )  {	
	ShowItem("ss2ValidationAge", true);
        nrOfErrors++;
    }
    if( ! isValidSs2Crcl(crcl, crclUnity) ) {	
	if( calcVisible ) {
	    ShowItem("ss2ValidationCrclCalc", true);
	}
	else {
	    ShowItem("ss2ValidationCrcl", true);
	}
	nrOfErrors++;
    }

    if( ! isValidSs2Lvef(lvef) ) {	
	ShowItem("ss2ValidationLvef", true);
	nrOfErrors++;
    }

    if( lms == "" ) {
	ShowItem("ss2ValidationLeftMain", true);
	nrOfErrors++;	
    }

    if( gender == "" ) {
	ShowItem("ss2ValidationGender", true);
	nrOfErrors++;	
    }

    if( copd == "" ) {
	ShowItem("ss2ValidationCopd", true);
	nrOfErrors++;	
    }

    if( pvd == "" ) {
	ShowItem("ss2ValidationPvd", true);
	nrOfErrors++;	
    }

    if( nrOfErrors > 0 ) {
	ShowItem("ss2ValidationError", true);
	return false;
    }

    return true;
}

/* Unity is not used anymore, always mlmin */
function getCrcl(age, gender, crclUnity) {
    if( calcVisible ) {
	var calculatedCrcl = performCockroftCalc(age, gender);
	return calculatedCrcl;
    }
    else {
	return getElementInForm('right', 'syntaxScore2Form', 'crcl').value;
    }
}

function calcSyntaxScore2() {
    // fetch input
    var ss2Syntaxscore1 = getElementInForm('right', 'syntaxScore2Form', 'ss2SyntaxScore1').value;
    var age = getElementInForm('right', 'syntaxScore2Form', 'age').value;
    var gender = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'gender'));
    var crclUnity = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'crclUnity'));
    var crcl = getCrcl(age, gender, crclUnity);
    var lvef = getElementInForm('right', 'syntaxScore2Form', 'lvef').value;
    var lms = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'leftMain'));
    var copd = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'copd'));
    var pvd = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'pvd'));

    // calc step 2
    z_PCI   = $V([1, ss2Syntaxscore1, parseInt(age), Math.min(crcl,90), Math.min(lvef,50), 
               parseInt(lms), parseInt(gender), parseInt(copd), parseInt(pvd)]);
    z_CABG  = $V([0, ss2Syntaxscore1, parseInt(age), Math.min(crcl,90), Math.min(lvef,50), 
               parseInt(lms), parseInt(gender), parseInt(copd), parseInt(pvd)]);
    z_delta = $V([1, ss2Syntaxscore1, parseInt(age), Math.min(crcl,90), Math.min(lvef,50), 
               parseInt(lms), parseInt(gender), parseInt(copd), parseInt(pvd)]);

    // calc step 3
    lp_PCI = z_PCI.dot(gamma_PCI);
    lp_CABG = z_CABG.dot(gamma_CABG);
    lp_delta = lp_PCI - lp_CABG;
    se_delta = Math.sqrt(z_delta.dot(matrix_T.transpose().multiply(z_delta)));

    // calc step 4 (results)
    ss2_PCI  = ((lp_PCI - lp_center - nomogram_intercept) / nomogram_slope);
    ss2_CABG = ((lp_CABG - lp_center-nomogram_intercept) / nomogram_slope);
    M_PCI  = 100 * (1 - Math.exp(-cum_haz*Math.exp(lp_PCI-lp_center)));
    M_CABG = 100 * (1 - Math.exp(-cum_haz*Math.exp(lp_CABG-lp_center)));

    // p_value
    var n = new NormalDistribution(0, 1);
    p_value = n._cdf(-Math.abs(lp_delta)/se_delta, true, false);


    parent.meScore2PValue = p_value;
    parent.meScore2PCI = ss2_PCI;
    parent.meScore2CABG = ss2_CABG;
    parent.meScore2PCI_M = M_PCI;
    parent.meScore2CABG_M = M_CABG;


    parent.meScore2Active = true;

    parent.navigateToScoreOverview();    
}


function printSyntaxScore1(){
    return document.write(parent.meScore);
}

function toggleCalcVisibility(){
    if( calcVisible ){
	calcVisible = false;
	ShowItemCalc('crclDirectInput', true);
	ShowItemCalc('crclDirectValidation', true);
	ShowItemCalc('crclCalculatorInput', false);
	ShowItemCalc('crclCalculatorValidation', false);
    }
    else {
	calcVisible = true;
	ShowItemCalc('crclDirectInput', false);
	ShowItemCalc('crclDirectValidation', false);
	ShowItemCalc('crclCalculatorInput', true);
	ShowItemCalc('crclCalculatorValidation', true);
    }
}

function performCockroftCalc(age, gender) {
    var weight = document.getElementById("crclCalcWeight").value;
    var serumC = document.getElementById("crclCalcSerum").value;
    var weightUnity = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'crclCalcWeightUnity'));
    var serumCUnity = getCheckedValue(getElementInForm('right', 'syntaxScore2Form', 'crclCalcSerumCUnity'));


    if (isNumber(age) && isNumber(weight) && isNumber(serumC)) {
//  toevoeging MvG maart 2014, extra validatie in CG calc  
	    if (((weightUnity == "pounds" && weight >= 66 && weight <= 550) || (weightUnity != "pounds" && weight >= 30 && weight <= 250)) && ((serumCUnity == "mgdl" && serumC > 0 && serumC <= 10) || (serumCUnity != "mgdl" && serumC > 0 && serumC <= 884))){

				calcWeight = ( weightUnity == "pounds" ? weight * 0.4536 : weight);
				calcSerumC = ( serumCUnity == "mgdl" ? serumC : serumC / 88.4 );
				return Math.round((((140 - age) * calcWeight) / (72 * calcSerumC)) * (gender == 0 ? 0.85 : 1) * 100) / 100;
		    }
   
    }
    else {
	return "";
    }
    
} 

function ss2GenMulti(value) {
    if( value ) {
	getElementInForm('right', 'syntaxScore2Form', 'gender')[0].checked = true;
	getElementInForm('right', 'syntaxScore2Form', 'crclCalcGender')[0].checked = true;	
    }
    else {
	getElementInForm('right', 'syntaxScore2Form', 'gender')[1].checked = true;
	getElementInForm('right', 'syntaxScore2Form', 'crclCalcGender')[1].checked = true;	
    }
}
