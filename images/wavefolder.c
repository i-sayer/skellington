#define _limit 0.99999

static inline float saturate( float input ) { //clamp without branching
    float x1 = fabsf( input + _limit );
    float x2 = fabsf( input - _limit );
    return 0.5 * (x1 - x2);
}

t_int *wavefolder_tilde_perform(t_int *w) {
  t_wavefolder_tilde   *x =   (t_wavefolder_tilde *)(w[1]);
    t_sample      *in =       (t_sample *)(w[2]);
    t_sample      *thresh =       (t_sample *)(w[3]);
    t_sample      *pthresh =       (t_sample *)(w[4]);
    t_sample     *out =       (t_sample *)(w[5]);
    t_sample     *pout =       (t_sample *)(w[6]);
  int             n =              (int)(w[7]);
    t_float insample = 0;
    t_float outsample = 0;
    t_float thsample = 0;
    t_float pthsample = 0;
    t_float reciprocal = 0;
    t_float remainder = 0;
    t_float remciprocal = 0;
        
  while (n--) 
  {
      insample = *in++;
      thsample = saturate(*thresh++);
      thsample = thsample * 0.5 + 0.5;
      pthsample = *pthresh++;
      reciprocal = 1 / thsample;
      remainder = 1 - thsample;
      remciprocal = 1 / remainder;
      if(x->bipolar != 0) {
      outsample = *out++ = (insample < thsample ? insample * reciprocal : 1 - ((insample - thsample) * remciprocal)) * 2 - 1;
      }
      else if(x->bipolar == 0) {
          outsample = *out++ = insample < thsample ? insample * reciprocal : 1 - ((insample - thsample) * remciprocal);
      }
      if(x->bipolar == 0) {
          pthsample = pthsample * 0.5 + 0.5;
          *pout++ = outsample > pthsample ? 1 : 0;
      }
      else if(x->bipolar != 0) {
          *pout++ = outsample > pthsample ? 1 : -1;
      }
  }
    return (w+8);
}