/*
 * Copyright 2017, Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Note: this file is purely for documentation. Any contents are not expected
 * to be loaded as the JS file.
 */

/**
 * The top-level message sent by the client for the `ListVoices` method.
 *
 * @property {string} filter
 *   Optional filter applied to search results.
 *   e.g. 'language_codes:"en-us"' will return the voices supported for
 *   American English; 'language_codes:"es-*" AND gender=MALE' will return
 *   the male voices supported for Spanish.
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.ListVoicesRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var ListVoicesRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The message returned to the client by the `ListVoices` method.
 *
 * @property {Object[]} voices
 *   The list of voices.
 *
 *   This object should have the same structure as [Voice]{@link Voice}
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.ListVoicesResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var ListVoicesResponse = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Description of a voice supported by the TTS service.
 *
 * @property {string[]} languageCodes
 *   The languages that this voice supports, expressed as
 *   [BCP-47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) language tags (e.g.
 *   "en-US", "es-419", "cmn-tw").
 *
 * @property {string} name
 *   The name of this voice.  Each distinct voice has a unique name.
 *
 * @property {number} gender
 *   The gender of this voice.
 *
 *   The number should be among the values of [VoiceGender]{@link VoiceGender}
 *
 * @property {number} naturalSampleRateHertz
 *   The natural sample rate (in hertz) for this voice.
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.Voice definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var Voice = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The top-level message sent by the client for the `SynthesizeSpeech` method.
 *
 * @property {Object} input
 *   Required. The Synthesizer requires either plain text or SSML as input.
 *
 *   This object should have the same structure as [SynthesisInput]{@link SynthesisInput}
 *
 * @property {Object} voice
 *   Required. The desired voice of the synthesized audio.
 *
 *   This object should have the same structure as [VoiceSelectionParams]{@link VoiceSelectionParams}
 *
 * @property {Object} audioConfig
 *   Required. The configuration of the synthesized audio.
 *
 *   This object should have the same structure as [AudioConfig]{@link AudioConfig}
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.SynthesizeSpeechRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var SynthesizeSpeechRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Contains text input to be synthesized. Either `text` or `ssml` must be
 * supplied. Supplying both or neither returns
 * {@link google.rpc.Code.INVALID_ARGUMENT}. The input size is limited to 5000
 * characters.
 *
 * @property {string} text
 *   The raw text to be synthesized.
 *
 * @property {string} ssml
 *   The SSML document to be synthesized. The SSML document must be valid
 *   and well-formed. Otherwise the RPC will fail and return
 *   {@link google.rpc.Code.INVALID_ARGUMENT}. For more information, see
 *   [SSML](https://developers.google.com/actions/reference/ssml).
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.SynthesisInput definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var SynthesisInput = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Description of which voice to use for a synthesis request.
 *
 * @property {string} languageCode
 *   The language (and optionally also the region) of the voice expressed as a
 *   [BCP-47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) language tag, e.g.
 *   "en-US". Required. This should not include a script tag (e.g. use
 *   "cmn-cn" rather than "cmn-Hant-cn"), because the script will be inferred
 *   from the input provided in the SynthesisInput.  The TTS service
 *   will use this parameter to help choose an appropriate voice.  Note that
 *   the TTS service may choose a voice with a slightly different language code
 *   than the one selected; it may substitute a different region
 *   (e.g. using en-US rather than en-CA if there isn't a Canadian voice
 *   available), or even a different language, e.g. using "nb" (Norwegian Bokmal)
 *   instead of "no" (Norwegian)".
 *
 * @property {string} name
 *   The name of the voice. Optional; if not set, the service will choose a
 *   voice based on the other parameters such as language_code and gender.
 *
 * @property {number} gender
 *   The preferred gender of the voice. Optional; if not set, the service will
 *   choose a voice based on the other parameters such as language_code and
 *   name. Note that this is only a preference, not requirement; if a
 *   voice of the appropriate gender is not available, the synthesizer should
 *   substitute a voice with a different gender rather than failing the request.
 *
 *   The number should be among the values of [VoiceGender]{@link VoiceGender}
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.VoiceSelectionParams definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var VoiceSelectionParams = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Description of audio data to be synthesized.
 *
 * @property {number} audioEncoding
 *   Required. The format of the requested audio byte stream.
 *
 *   The number should be among the values of [AudioEncoding]{@link AudioEncoding}
 *
 * @property {number} speakingRate
 *   Optional speaking rate/speed, in the range [0.25, 4.0]. 1.0 is the normal
 *   native speed supported by the specific voice. 2.0 is twice as fast, and
 *   0.5 is half as fast. If unset(0.0), defaults to the native 1.0 speed. Any
 *   other values < 0.25 or > 4.0 will return an error.
 *
 * @property {number} pitch
 *   Optional speaking pitch, in the range [-20.0, 20.0]. 20 means increase 20
 *   semitones from the original pitch. -20 means decrease 20 semitones from the
 *   original pitch.
 *
 * @property {number} volumeGainDb
 *   Optional volume gain (in dB) of the normal native volume supported by the
 *   specific voice, in the range [-96.0, 16.0]. If unset, or set to a value of
 *   0.0 (dB), will play at normal native signal amplitude. A value of -6.0 (dB)
 *   will play at approximately half the amplitude of the normal native signal
 *   amplitude. A value of +6.0 (dB) will play at approximately twice the
 *   amplitude of the normal native signal amplitude. Strongly recommend not to
 *   exceed +10 (dB) as there's usually no effective increase in loudness for
 *   any value greater than that.
 *
 * @property {number} sampleRateHertz
 *   The synthesis sample rate (in hertz) for this audio. Optional.  If this is
 *   different from the voice's natural sample rate, then the synthesizer will
 *   honor this request by converting to the desired sample rate (which might
 *   result in worse audio quality), unless the specified sample rate is not
 *   supported for the encoding chosen, in which case it will fail the request
 *   and return {@link google.rpc.Code.INVALID_ARGUMENT}.
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.AudioConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var AudioConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The message returned to the client by the `SynthesizeSpeech` method.
 *
 * @property {string} audioContent
 *   The audio data bytes encoded as specified in the request, including the
 *   header (For LINEAR16 audio, we include the WAV header). Note: as
 *   with all bytes fields, protobuffers use a pure binary representation,
 *   whereas JSON representations use base64.
 *
 * @class
 * @see [google.cloud.texttospeech.v1beta1.SynthesizeSpeechResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto}
 */
var SynthesizeSpeechResponse = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Possible gender for the voice model.
 *
 * @enum {number}
 */
var VoiceGender = {

  /**
   * An unspecified gender.
   */
  VOICE_GENDER_UNSPECIFIED: 0,

  /**
   * A male voice.
   */
  MALE: 1,

  /**
   * A female voice.
   */
  FEMALE: 2
};

/**
 * Configuration to set up audio encoder. The encoding determines the output
 * audio format that we'd like.
 *
 * @enum {number}
 */
var AudioEncoding = {

  /**
   * Not specified. Will return result {@link google.rpc.Code.INVALID_ARGUMENT}.
   */
  AUDIO_ENCODING_UNSPECIFIED: 0,

  /**
   * Uncompressed 16-bit signed little-endian samples (Linear PCM).
   * Audio content returned as LINEAR16 also contains a WAV header.
   * api-linter: naming-format=disabled
   */
  LINEAR16: 1,

  /**
   * MP3 audio.
   * api-linter: naming-format=disabled
   */
  MP3: 2,

  /**
   * Opus encoded audio wrapped in an ogg container. The result will be a
   * file which can be played natively on Android, and in browsers (at least
   * Chrome and Firefox). The quality of the encoding is considerably higher
   * than MP3 while using approximately the same bitrate.
   */
  OGG_OPUS: 3
};