class Cube {
    constructor() {
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum=-2;
    }
    render() {

        var rgba = this.color;
        //pass the texture Number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        // Front of Cube
        drawTriangle3DUVNormal([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [1, 0, 0, 1, 0, 0], [0, 0, -1, 0, 0, -1, 0, 0, -1]);
        drawTriangle3DUVNormal([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0], [1, 0, 1, 1, 0, 1], [0, 0, -1, 0, 0, -1, 0, 0, -1]);

        // Back
        drawTriangle3DUVNormal([0, 0, 1, 1, 1, 1, 1, 0, 1], [0, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
        drawTriangle3DUVNormal([0, 0, 1, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1], [0, 0, 1, 0, 0, 1, 0, 0, 1]);

        // Top
        drawTriangle3DUVNormal([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1], [0, 1, 0, 0, 1, 0, 0, 1, 0]);
        drawTriangle3DUVNormal([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0], [0, 1, 0, 0, 1, 0, 0, 1, 0]);

        // Bottom
        drawTriangle3DUVNormal([0, 0, 0, 0, 0, 1, 1, 0, 1], [0, 0, 0, 1, 1, 1], [0, -1, 0, 0, -1, 0, 0, -1, 0]);
        drawTriangle3DUVNormal([0, 0, 0, 1, 0, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0], [0, -1, 0, 0, -1, 0, 0, -1, 0]);

        // Left
        drawTriangle3DUVNormal([0, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0, 1, 1, 0], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);
        drawTriangle3DUVNormal([0, 1, 1, 0, 1, 0, 0, 0, 1], [1, 1, 0, 1, 1, 0], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);

        // Right
        drawTriangle3DUVNormal([1, 0, 0, 1, 1, 1, 1, 1, 0], [1, 0, 0, 1, 1, 1], [1, 0, 0, 1, 0, 0, 1, 0, 0]);
        drawTriangle3DUVNormal([1, 0, 0, 1, 1, 1, 1, 0, 1], [1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    }

    renderfast(){
        var rgba = this.color;
        //pass the texture Number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];
        //front
        allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);
        //back
        allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
        allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
        //top
        allverts = allverts.concat([0,1,0, 1,1,0, 1,1,1]);
        allverts = allverts.concat([0,1,1, 0,1,0, 1,1,1]);
        //bottom
        allverts = allverts.concat([0,0,0, 0,0,1, 1,0,0]);
        allverts = allverts.concat([1,0,0, 1,0,1, 0,0,1]);
        //left
        allverts = allverts.concat([0,0,0, 0,1,0, 0,1,1]);
        allverts = allverts.concat([0,1,1, 0,0,0, 0,0,1]);
        //right
        allverts = allverts.concat([1,1,0, 1,1,1, 1,0,0]);
        allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);
        drawTriangle3D(allverts);
    }
}