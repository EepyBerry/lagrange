// Slightly ajusted from Daniel Greenheck (huge thanks!):
// https://github.com/dgreenheck/threejs-procedural-planets
/*
MIT License

Copyright (c) 2023 Daniel Greenheck

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// ------------------------------------------------------------------------------------------------

// Perturbs a surface normal from computed heights
vec3 perturb_normal(vec3 pos, vec3 dx, vec3 dy,
                   float height, float dxHeight, float dyHeight,
                   float radius, float bumpStrength) {
    vec3 hPos = pos * (radius + height);
    vec3 dxPos = (pos + dx) * (radius + dxHeight);
    vec3 dyPos = (pos + dy) * (radius + dyHeight);
    vec3 bumpN = normalize(cross(dxPos - hPos, dyPos - hPos));
    return normalize(mix(vNormal, bumpN, bumpStrength));
}