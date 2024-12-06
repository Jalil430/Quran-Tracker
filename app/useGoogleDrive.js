import { useState, useCallback } from 'react';

const GOOGLE_CLIENT_ID = '1066035178493-li8s5qle394uml0thved2d30v78igb7t.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyDIHrRqCjx0XWht4GtdP2l_ICgsGoQT_bA';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

export function useGoogleDrive() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const initialize = useCallback(async () => {
    try {
      const gapi = await import('gapi-script').then(x => x.gapi);
      await new Promise((resolve) => gapi.load('client:auth2', resolve));
      await gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });

      gapi.auth2.getAuthInstance().isSignedIn.listen(setIsSignedIn);
      setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
    } catch (error) {
      console.error('Error initializing Google Drive:', error);
    }
  }, []);

  const signIn = useCallback(async () => {
    try {
      const gapi = await import('gapi-script').then(x => x.gapi);
      await gapi.auth2.getAuthInstance().signIn();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const gapi = await import('gapi-script').then(x => x.gapi);
      await gapi.auth2.getAuthInstance().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const saveToGDrive = useCallback(async (data) => {
    try {
      const gapi = await import('gapi-script').then(x => x.gapi);
      const response = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name='quran-progress.json'"
      });

      const file = response.result.files[0];
      const fileContent = JSON.stringify(data);

      if (file) {
        // Update existing file
        await gapi.client.request({
          path: `/upload/drive/v3/files/${file.id}`,
          method: 'PATCH',
          params: { uploadType: 'media' },
          body: fileContent
        });
      } else {
        // Create new file
        await gapi.client.drive.files.create({
          resource: {
            name: 'quran-progress.json',
            parents: ['appDataFolder']
          },
          media: {
            mimeType: 'application/json',
            body: fileContent
          },
          fields: 'id'
        });
      }
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
    }
  }, []);

  const loadFromGDrive = useCallback(async () => {
    try {
      const gapi = await import('gapi-script').then(x => x.gapi);
      const response = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name='quran-progress.json'"
      });

      const file = response.result.files[0];
      if (file) {
        const result = await gapi.client.drive.files.get({
          fileId: file.id,
          alt: 'media'
        });
        return JSON.parse(result.body);
      }
      return null;
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      return null;
    }
  }, []);

  return {
    isSignedIn,
    initialize,
    signIn,
    signOut,
    saveToGDrive,
    loadFromGDrive
  };
}