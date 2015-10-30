#include "ofApp.h"
#include <iostream>

//--------------------------------------------------------------
void ofApp::setup(){
    
    vector< ofVideoDevice > a = vidGrabber.listDevices();
    vidGrabber.setDeviceID(a[1].id);
    vidGrabber.setVerbose(true);
    vidGrabber.initGrabber(1280,720);
    
    colorImg.allocate(1280,720);
	grayBg.allocate(1280,720);
    grayDiff.allocate(1280,720);

	bLearnBakground = true;
	threshold = 40;
    
    midiOut.openPort(0);
    channel = 1;
    currentPgm = 0;
    note = 0;
    velocity = 0;
    pan = 0;
    bend = 0;
    touch = 0;
    polytouch = 0;
    
    numberOfBlobs = 0;
    
    trackingArea.set(0, 0, 1280, 600);

}

//--------------------------------------------------------------
void ofApp::update(){
	ofBackground(100,100,100);

    bool bNewFrame = false;

    vidGrabber.update();
    bNewFrame = vidGrabber.isFrameNew();

	if (bNewFrame){
        colorImg.setFromPixels(vidGrabber.getPixels(), 1280,720);

        grayImage = colorImg;
		if (bLearnBakground == true){
			grayBg = grayImage;		// the = sign copys the pixels from grayImage into grayBg (operator overloading)
			bLearnBakground = false;
		}

		// take the abs value of the difference between background and incoming and then threshold:
		grayDiff.absDiff(grayBg, grayImage);
		grayDiff.threshold(threshold);

		// find contours which are between the size of 20 pixels and 1/3 the w*h pixels.
		// also, find holes is set to true so we will get interior contours as well....
		contourFinder.findContours(grayDiff, 20, (1280*720)/3, 10, true);	// find holes
        _blobTracker.track(&contourFinder); 
	}
    
    if (numberOfBlobs < contourFinder.nBlobs){
        cout << "number of blobs changed "<< numberOfBlobs <<" "<< contourFinder.nBlobs<< "\n  ";
    }
    
    numberOfBlobs = contourFinder.nBlobs;
    
    for (int i = 0; i < numberOfBlobs; i++){
        if (trackingArea.intersects(contourFinder.blobs[i].boundingRect)) {
            ofPoint pos = contourFinder.blobs[i].boundingRect.getPosition();
            note = ofMap(pos.x, 48, 122, 0, 127);
            velocity = 64;
            midiOut.sendNoteOn(i+1, note,  velocity);
            changeControl(pos.x, pos.y, i+1);
        }
    }

}

//--------------------------------------------------------------
void ofApp::draw(){

	ofSetHexColor(0xffffff);
	colorImg.draw(0,0);

    ofFill();   //digo llenar
	ofSetHexColor(0x333333); //seteo color para el relleno
	//ofRect(20,20,400,300);  //construyo un rectangulo para el fondo
    ofSetColor(ofColor::yellowGreen); //cambio el color para la linea
    //ofRect(0, 0, 1280, 600);
    
    numberOfBlobs = contourFinder.nBlobs;
    
    for (int i = 0; i < numberOfBlobs; i++){

        if (trackingArea.intersects(contourFinder.blobs[i].boundingRect)) {
            float area = trackingArea.getIntersection(contourFinder.blobs[i].boundingRect).getArea();
            string stringarea = ofToString(area);
            
            ofSetColor(ofColor::red);
            ofDrawBitmapString(stringarea,
                               contourFinder.blobs[i].boundingRect.getCenter().x + 20,
                               contourFinder.blobs[i].boundingRect.getCenter().y + 20);
            
            ofSetColor(ofColor::white);
            ofPoint pos = contourFinder.blobs[i].boundingRect.getPosition();
            string stringpos = ofToString(pos);
            ofDrawBitmapString(stringpos,
                               contourFinder.blobs[i].boundingRect.getCenter().x + 20,
                               contourFinder.blobs[i].boundingRect.getCenter().y + 40);
            
            ofSetColor(ofColor::blue);
            ofDrawBitmapString("ID:" + ofToString(contourFinder.blobs[i].id),
                               contourFinder.blobs[i].boundingRect.getCenter().x + 20,
                               contourFinder.blobs[i].boundingRect.getCenter().y + 60);

            contourFinder.blobs[i].draw(0,0);
        }
    }

	// finally, a report:
	ofSetHexColor(0xffffff);
	stringstream reportStr;
	reportStr << "press ' ' to capture bg" << endl
			  << "threshold " << threshold << " (press: +/-)" << endl
              << "num blobs found " << contourFinder.nBlobs << ", fps: " << ofGetFrameRate();
	ofDrawBitmapString(reportStr.str(), 20, 400);

}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

	switch (key){
		case ' ':
			bLearnBakground = true;
			break;
		case '+':
			threshold ++;
			if (threshold > 255) threshold = 255;
			break;
		case '-':
			threshold --;
			if (threshold < 0) threshold = 0;
			break;
	}
}

void ofApp::changeControl(int x, int y, int channel){
    panx = ofMap(x,0,1280,0,127);
    midiOut.sendControlChange(channel, 16, panx);
    pany = ofMap(y,0,720,0,127);
    midiOut.sendControlChange(channel, 17, pany);
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
