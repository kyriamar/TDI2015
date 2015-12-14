#include "ofApp.h"
#include <iostream>

//--------------------------------------------------------------
void ofApp::setup(){
    myfont.loadFont("arial.ttf", 24);
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
    
    midiNote[36] = make_pair(3,"DO");
    midiNote[37] = make_pair(3,"DO#");
    midiNote[38] = make_pair(3,"RE");
    midiNote[39] = make_pair(3,"RE#");
    midiNote[40] = make_pair(3,"MI");
    midiNote[41] = make_pair(3,"FA");
    midiNote[42] = make_pair(3,"FA#");
    midiNote[43] = make_pair(3,"SOL");
    midiNote[44] = make_pair(3,"SOL#");
    midiNote[45] = make_pair(3,"LA");
    midiNote[46] = make_pair(3,"LA#");
    midiNote[47] = make_pair(3,"SI");
    
    midiNote[48] = make_pair(4,"DO");
    midiNote[49] = make_pair(4,"DO#");
    midiNote[50] = make_pair(4,"RE");
    midiNote[51] = make_pair(4,"RE#");
    midiNote[52] = make_pair(4,"MI");
    midiNote[53] = make_pair(4,"FA");
    midiNote[54] = make_pair(4,"FA#");
    midiNote[55] = make_pair(4,"SOL");
    midiNote[56] = make_pair(4,"SOL#");
    midiNote[57] = make_pair(4,"LA");
    midiNote[58] = make_pair(4,"LA#");
    midiNote[59] = make_pair(4,"SI");
    
    midiNote[60] = make_pair(5,"DO");
    midiNote[61] = make_pair(5,"DO#");
    midiNote[62] = make_pair(5,"RE");
    midiNote[63] = make_pair(5,"RE#");
    midiNote[64] = make_pair(5,"MI");
    midiNote[65] = make_pair(5,"FA");
    midiNote[66] = make_pair(5,"FA#");
    midiNote[67] = make_pair(5,"SOL");
    midiNote[68] = make_pair(5,"SOL#");
    midiNote[69] = make_pair(5,"LA");
    midiNote[70] = make_pair(5,"LA#");
    midiNote[71] = make_pair(5,"SI");
    
    midiNote[72] = make_pair(6,"DO");
    midiNote[73] = make_pair(6,"DO#");
    midiNote[74] = make_pair(6,"RE");
    midiNote[75] = make_pair(6,"RE#");
    midiNote[76] = make_pair(6,"MI");
    midiNote[77] = make_pair(6,"FA");
    midiNote[78] = make_pair(6,"FA#");
    midiNote[79] = make_pair(6,"SOL");
    midiNote[80] = make_pair(6,"SOL#");
    midiNote[81] = make_pair(6,"LA");
    midiNote[82] = make_pair(6,"LA#");
    midiNote[83] = make_pair(6,"SI");
    
    midiNote[84] = make_pair(7,"DO");
    midiNote[85] = make_pair(7,"DO#");
    midiNote[86] = make_pair(7,"RE");
    midiNote[87] = make_pair(7,"RE#");
    midiNote[88] = make_pair(7,"MI");
    midiNote[89] = make_pair(7,"FA");
    midiNote[90] = make_pair(7,"FA#");
    midiNote[91] = make_pair(7,"SOL");
    midiNote[92] = make_pair(7,"SOL#");
    midiNote[93] = make_pair(7,"LA");
    midiNote[94] = make_pair(7,"LA#");
    midiNote[95] = make_pair(7,"SI");

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
		contourFinder.findContours(grayDiff, 20, (1280*720)/3, 10, false);	// find holes
        _blobTracker.track(&contourFinder);
	}

//    if (numberOfBlobs < contourFinder.nBlobs){
//        cout << "number of blobs changed "<< numberOfBlobs <<" "<< contourFinder.nBlobs<< "\n  ";
//    }

    numberOfBlobs = contourFinder.nBlobs;
    vector<string> listOfBlobs;
    vector<string> toDelete;

    for (int i = 0; i < min(numberOfBlobs,4); i++){
        string id = ofToString(contourFinder.blobs[i].id);
        listOfBlobs.push_back(id);
    }


    for(map<string,pair<string, int> >::iterator it = blob_mapping.begin(); it != blob_mapping.end(); it++) {
        string id = it->first;

        if(std::find(listOfBlobs.begin(), listOfBlobs.end(), id) != listOfBlobs.end()) {
            /* v contains x */
        } else {
            cout << "Off " << blob_mapping[id].first << endl;
            midiOut.sendNoteOff(blob_mapping[id].second, ofToInt(blob_mapping[id].first),0);
            toDelete.push_back(id);
        }
    }

    for (int i = 0; i < toDelete.size(); i++){
        map<string,pair<string, int> >::iterator it = blob_mapping.find(toDelete[i]);
        blob_mapping.erase (it);
    }



    for (int i = 0; i < min(numberOfBlobs,4); i++){

        if (trackingArea.intersects(contourFinder.blobs[i].boundingRect)) {

            string id = ofToString(contourFinder.blobs[i].id);
            ofPoint pos = contourFinder.blobs[i].boundingRect.getPosition();

            float area = trackingArea.getIntersection(contourFinder.blobs[i].boundingRect).getArea();
            note = ofMap(area, 0, 11000, 95, 36,true);

            if  (blob_mapping.find(id) == blob_mapping.end()){
                blob_mapping[id] = make_pair(ofToString(note), i+1);
                velocity = 100;
                cout << "On " << note << endl;

                midiOut.sendNoteOn(i+1, note,  velocity);
                changeControl(pos.x, pos.y, i+1);
            }else {
                if (ofToString(note) != blob_mapping[id].first){
                    cout << "Off " << blob_mapping[id].first << endl;
                    midiOut.sendNoteOff(blob_mapping[id].second, ofToInt(blob_mapping[id].first),0);

                    blob_mapping[id] = make_pair(ofToString(note), i+1);
                    velocity = 100;

                    cout << "On " << note << endl;
                    midiOut.sendNoteOn(i+1, note,  velocity);
                    changeControl(pos.x, pos.y, i+1);
                }
            }
        }
    }

}

//--------------------------------------------------------------
void ofApp::draw(){



	ofSetHexColor(0xffffff);
	colorImg.draw(0,0);

//    ofFill();   //digo llenar
//	ofSetHexColor(0x333333); //seteo color para el relleno
//	ofRect(20,20,400,300);  //construyo un rectangulo para el fondo
	ofNoFill();
    ofSetColor(ofColor::yellowGreen); //cambio el color para la linea
    ofRect(10, 10, 1260, 600);


    numberOfBlobs = contourFinder.nBlobs;

    for (int i = 0; i < min(numberOfBlobs,4); i++){

        if (trackingArea.intersects(contourFinder.blobs[i].boundingRect)) {
            float area = trackingArea.getIntersection(contourFinder.blobs[i].boundingRect).getArea();
            string stringarea = ofToString(area);
            note = ofMap(area, 0, 11000, 95, 36,true);

            ofSetColor(ofColor::red);
            ofDrawBitmapString(stringarea,
                               contourFinder.blobs[i].boundingRect.getCenter().x + 20,
                               contourFinder.blobs[i].boundingRect.getCenter().y + 20);

            ofSetColor(ofColor::yellow);
            myfont.drawString(midiNote[note].second+", "+ ofToString(midiNote[note].first),
                              contourFinder.blobs[i].boundingRect.getCenter().x + 20,
                              contourFinder.blobs[i].boundingRect.getCenter().y + 80);

            contourFinder.blobs[i].draw(0,0);
        }
    }

	// finally, a report:
	ofSetColor(ofColor::white);
	stringstream reportStr;
	reportStr << "press ' ' to capture bg" << endl
			  << "threshold " << threshold << " (press: +/-)" << endl
              << "num blobs found " << min(contourFinder.nBlobs,4)<< ", fps: " << ofGetFrameRate();
	ofDrawBitmapString(reportStr.str(), 20, 650);

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
        case 'a':
            midiOut.sendNoteOn(1, 60,  velocity);
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
