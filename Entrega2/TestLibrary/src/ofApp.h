#pragma once

#include "ofMain.h"

#include "ofxOpenCv.h"
#include "ofxMidi.h"
#include "ofMain.h"

class ofApp : public ofBaseApp{

	public:
		void setup();
		void update();
		void draw();
        void changeControl(int x, int y, int channel);
		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y );
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
    
        ofxMidiOut midiOut;
        unsigned int currentPgm;
        int channel,note, velocity;
        int pan, bend, touch, polytouch, numberOfBlobs, panx, pany;
    
        ofVideoGrabber 		vidGrabber;
        ofxCvColorImage			colorImg;

        ofxCvGrayscaleImage 	grayImage;
		ofxCvGrayscaleImage 	grayBg;
		ofxCvGrayscaleImage 	grayDiff;

        ofxCvContourFinder 	contourFinder;
        ofRectangle trackingArea;
    
        // ---> tracking blob id
        ofxBlobTracker _blobTracker;
    
        std::map<std::string, std::pair<std::string,int> > blob_mapping;

		int 				threshold;
		bool				bLearnBakground;


};

