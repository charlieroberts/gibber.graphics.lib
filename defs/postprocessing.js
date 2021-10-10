const optional = true,
      required = true

module.exports = [
  {
    name: "Bloom",
    prototype: "postprocessing",
    doc: "The Bloom effect creates blurred glow effects in areas of the scene that are brighter than a specific *threshold* property.",
    properties: {
      threshold: {
        isa: "number(sequencable)",
        type: "float",          
        default: 0,
        doc: "Pixels with a brightness value above the threshold property will be spread their brightness to adjacent pixels, creating a glow effect."
      },
      amount: {
        isa: "number(sequencable)",
        type: "float",          
        default: .01,
        doc: "The amount to boost the brightness of pixels that this effect operates on. High values (above 2) will result in blurred offsets that create duplicate images." 
      }
    }
  },
  {
    name: "Blur",
    prototype: "postprocessing",
    doc: "The Blur effect... blurs the final image on both axes. This operation can be repeated multiple times via the `.repetitions` argument to the constructor, and the number of samples used in the blur can also be increased in the constructor. Increasing these values will create a higher quality blur at an increased computational expense. The blur can cheaply be expanded by simply using the `.amount` property, which can be freely modified at runtime.",
    properties: {
      amount: {
        isa: "number(sequencable)",
        type: "float",          
        default: .01,
        doc: "The amount to boost the brightness of pixels that this effect operates on. High values (above 2) will result in blurred offsets that create duplicate images." 
      },
      repetitions: {
        type: "int",          
        default: 2,
        doc: "How many times to apply the blur effect. This property can *only be set in the constructor; it is not runtime editable.*", 
      },
      taps: {
        type: "int",          
        default: 5,
        doc: "The number of neighboring pixels that are sampled to genereate the blur. The available options are 5,9, and 13. This property can *only be set in the constructor; it is not runtime editable.*"      
      },
    }
  },
  {
    name: "Brightness",
    prototype: "postprocessing",
    doc: "The `Brightness` effect increases/decreases the overall brightness of the scene based on the `.amount` property.",
    properties: {
      amount: {
        isa: "number(sequencable)",
        type: "float",          
        default: .25,
        doc: "Values above 0 increase the original brightness of the scene, values below 0 decrease it." 
      },
    }
  },
  {
    name: "Contast",
    prototype: "postprocessing",
    doc: "The `Brightness` effect increases/decreases the overall contrast of the scene based on the `.amount` property.",
    properties: {
      amount: {
        isa: "number(sequencable)",
        type: "float",          
        default: .5,
        doc: "Values below 1 decrease the original contrast of the scene."
      },
    }
  },
  {
    name: "Edge",
    prototype: "postprocessing",
    doc: "The `Edge` effect finds the edges of images using the [sobel operator](https://en.wikipedia.org/wiki/Sobel_operator), potentially resulting in a stylized, cartoonish effect result.",
    properties: {
       mode: {
        type: "int",          
        default: 0,
        doc: "The mode property sets what algorithm is used by the Edge filter, with one of three possibilities: 0 - Classic Sobel edge detection; 1 "
      }   
    }
  },
  {
    name: "Focus",
    prototype: "postprocessing",
    doc: "`Focus` is used to create a depth-of-field effect, where parts of the image that are currently in focus (according to the value of the `.depth` property) will appear crisp, while the rest of the image is blurred.",
    properties: {
      depth: {
        isa: "number(sequencable)",
        type: "float",          
        default: 0,
        doc: "Given a value of 0, objects far from the camera will be blurred. Given a value of 1, objects close to the camera will be blurred.",
      },
      radius: {
        isa: "number(sequencable)",
        type: "float",          
        default: .01,
        doc: "How much of the image is in focus. Larger areas will result in mmore of the image being crisp at the specified depth level."
      }
    }
  },
  {
    name: "Godrays",
    prototype: "postprocessing",
    doc: "`Focus` is used to create a depth-of-field effect, where parts of the image that are currently in focus (according to the value of the `.depth` property) will appear crisp, while the rest of the image is blurred.",
    properties: {
      decay: {
        isa: "number(sequencable)",
        type: "float",          
        default: 1,
        doc: "How fast the rays fade as they travel from their source. Values higher than `1` will create feedback that can quickly overwhelm a scene."
      },
      weight: {
        isa: "number(sequencable)",
        type: "float",          
        default: .01,
        doc: "Multiplies the original background colors; higher values lead to brighter rays. This property expects very low values, typically between 0-.02.",
      },
      density: {
        isa: "number(sequencable)",
        type: "float",          
        default: 1,
        doc: "How close samples are together."
      },
      threshold: {
        isa: "number(sequencable)",
        type: "float",          
        default: .9,
        doc: "Controls at what depth (where 1 is the farthest visible depth) the rays begin."
      }, 
    }
  },
  {
    name: "Hue",
    prototype: "postprocessing",
    doc: "The `Hue` effect shifts the hue of objects below a provided depth threshold. Using the default threshold value of .99 the scene will be inverted while the background retains its original color. With a threshold value of 1 the background color will also be changed.",
    properties: {
      threshold: {
        isa: "number(sequencable)",
        type: "float",          
        default: .99,
        doc: "Object fragments with a depth below this number (where depth is normalized to be between 0–1) will have their color shifted, other parts of the scene will be unaffected. A depth of .99 should usually keep the background color the same while changing the rest of the scene."       
      },
      shift : {
        isa: "number(sequencable)",
        type: "float",          
        default: .5,
        doc: "The amount to shift the hue in the HSV color space." 
      }
    }
  },
  {
    name: "Invert",
    prototype: "postprocessing",
    doc: "The `Invert` effect inverts the color of objects below a provided depth threshold. Using the default threshold value of .99 (really, any value lower than 1) the scene will be inverted while the background retains its original color. With a threshold value of 1 the background color will also be changed.",
    properties: {
      threshold: {
        isa: "number(sequencable)",
        type: "float",          
        default: .99,
        doc: "Object fragments with a depth below this number (where depth is normalized to be between 0–1) will have their color inverted, other parts of the scene will be unaffected. A depth of .99 should usually keep the background color the same while changing the rest of the scene."       
      }
    }
  },
  {
    name: "MotionBlur",
    prototype: "postprocessing",
    doc: "The `MotionBlur` effect can be used to create everything from subtle blurring based on movement in the scene (similiar to the blurring created by 'real-life' movement) to trippy feedback fun.",
    properties: {
      amount: {
        isa: "number(sequencable)",
        type: "float",          
        default: .7,
        doc: "The amount of feedback used to create the blur effect. Values above `.9` can be quite fun and experimental, while lower values can be used to create pseudo-realistic blurring around moving objects."  
      }
    }
  },
]
