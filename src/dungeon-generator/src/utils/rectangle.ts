/*
 * Rectangle
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

import { Vector2 } from ".";

/**
 * @module EaselJS
 */

// constructor:
/**
 * Represents a rectangle as defined by the points (x, y) and (x+width, y+height).
 *
 * <h4>Example</h4>
 *
 *      var rect = new createjs.Rectangle(0, 0, 100, 100);
 *
 * @class Rectangle
 * @param {Number} [x=0] X position.
 * @param {Number} [y=0] Y position.
 * @param {Number} [width=0] The width of the Rectangle.
 * @param {Number} [height=0] The height of the Rectangle.
 * @constructor
 **/
class Rectangle{
  x = 0
  y = 0
  width =0
  height = 0
  constructor(location:Vector2,size?:Vector2)
  constructor(x :number , y : number, width?:number, height?:number)
  constructor(x:number | Vector2, y:number | Vector2 | undefined,width:number=0,height:number=0 ) {
    if (Array.isArray(x) && (Array.isArray(y) || y === undefined )) {
      [width, height] = y || [0,0];
      [x, y] = x
      this.setValues(x,y,width,height)
    } else if(
      ((!Array.isArray(x)) && Array.isArray(y))
    ) {
      throw new TypeError("If Y is an Vector2 then so should X")
    }else if (
      (Array.isArray(x) && !Array.isArray(y))
    ) {
      throw new TypeError("If X is an Vector2 then so should Y")
    } else if(typeof x == "number" && typeof y == "number") {
      this.setValues(x, y, width, height)
    }
    
    

  // public properties:
  // assigned in the setValues method.
  /**
   * X position.
   * @property x
   * @type Number
   **/

  /**
   * Y position.
   * @property y
   * @type Number
   **/

  /**
   * Width.
   * @property width
   * @type Number
   **/

  /**
   * Height.
   * @property height
   * @type Number
   **/
}
// public methods:
/**
 * Sets the specified values on this instance.
 * @method setValues
 * @param {Number} [x=0] X position.
 * @param {Number} [y=0] Y position.
 * @param {Number} [width=0] The width of the Rectangle.
 * @param {Number} [height=0] The height of the Rectangle.
 * @return {Rectangle} This instance. Useful for chaining method calls.
 * @chainable
 */
  setValues(x :number, y :number, width :number, height:number): Rectangle {
  // don't forget to update docs in the constructor if these change:
    this.x = x || 0
    this.y = y || 0
    this.width = width || 0
    this.height = height || 0
    return this
  }

/**
 * Extends the rectangle's bounds to include the described point or rectangle.
 * @method extend
 * @param {Number} x X position of the point or rectangle.
 * @param {Number} y Y position of the point or rectangle.
 * @param {Number} [width=0] The width of the rectangle.
 * @param {Number} [height=0] The height of the rectangle.
 * @return {Rectangle} This instance. Useful for chaining method calls.
 * @chainable
 */
  extend(x:number, y:number, width:number, height:number): Rectangle {
    width = width || 0
    height = height || 0
    if (x + width > this.x + this.width) {
      this.width = x + width - this.x
    }
    if (y + height > this.y + this.height) {
      this.height = y + height - this.y
    }
    if (x < this.x) {
      this.width += this.x - x
      this.x = x
    }
    if (y < this.y) {
      this.height += this.y - y
      this.y = y
    }
    return this
  }

/**
 * Adds the specified padding to the rectangle's bounds.
 * @method pad
 * @param {Number} top
 * @param {Number} left
 * @param {Number} right
 * @param {Number} bottom
 * @return {Rectangle} This instance. Useful for chaining method calls.
 * @chainable
 */
  pad (top: number, left: number, bottom: number, right: number): Rectangle {
    this.x -= left
    this.y -= top
    this.width += left + right
    this.height += top + bottom
    return this
  }

/**
 * Copies all properties from the specified rectangle to this rectangle.
 * @method copy
 * @param {Rectangle} rectangle The rectangle to copy properties from.
 * @return {Rectangle} This rectangle. Useful for chaining method calls.
 * @chainable
 */
  copy(rectangle:Rectangle):Rectangle {
    return this.setValues(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height
    )
  }

/**
 * Returns true if this rectangle fully encloses the described point or rectangle.
 * @method contains
 * @param {Number} x X position of the point or rectangle.
 * @param {Number} y Y position of the point or rectangle.
 * @param {Number} [width=0] The width of the rectangle.
 * @param {Number} [height=0] The height of the rectangle.
 * @return {Boolean} True if the described point or rectangle is contained within this rectangle.
 */
contains(x: number, y: number, width: number, height: number): boolean {
  width = width || 0
  height = height || 0
  return (
    x >= this.x &&
    x + width <= this.x + this.width &&
    y >= this.y &&
    y + height <= this.y + this.height
  )
}

/**
 * Returns a new rectangle which contains this rectangle and the specified rectangle.
 * @method union
 * @param {Rectangle} rect The rectangle to calculate a union with.
 * @return {Rectangle} A new rectangle describing the union.
 */
union(rect: Rectangle): Rectangle {
  return this.clone().extend(rect.x, rect.y, rect.width, rect.height)
}

/**
 * Returns a new rectangle which describes the intersection (overlap) of this rectangle and the specified rectangle,
 * or null if they do not intersect.
 * @method intersection
 * @param {Rectangle} rect The rectangle to calculate an intersection with.
 * @return {Rectangle} A new rectangle describing the intersection or null.
 */
intersection(rect: Rectangle): Rectangle | null {
  var x1 = rect.x
  var y1 = rect.y
  var x2 = x1 + rect.width
  var y2 = y1 + rect.height
  if (this.x > x1) {
    x1 = this.x
  }
  if (this.y > y1) {
    y1 = this.y
  }
  if (this.x + this.width < x2) {
    x2 = this.x + this.width
  }
  if (this.y + this.height < y2) {
    y2 = this.y + this.height
  }
  return x2 <= x1 || y2 <= y1 ? null : new Rectangle(x1, y1, x2 - x1, y2 - y1)
}

/**
 * Returns true if the specified rectangle intersects (has any overlap) with this rectangle.
 * @method intersects
 * @param {Rectangle} rect The rectangle to compare.
 * @return {Boolean} True if the rectangles intersect.
 */
intersects(rect: Rectangle): boolean {
  return (
    rect.x <= this.x + this.width &&
    this.x <= rect.x + rect.width &&
    rect.y <= this.y + this.height &&
    this.y <= rect.y + rect.height
  )
}

/**
 * Returns true if the width or height are equal or less than 0.
 * @method isEmpty
 * @return {Boolean} True if the rectangle is empty.
 */
isEmpty(): boolean {
  return this.width <= 0 || this.height <= 0
}

/**
 * Returns a clone of the Rectangle instance.
 * @method clone
 * @return {Rectangle} a clone of the Rectangle instance.
 **/
clone(): Rectangle {
  return new Rectangle(this.x, this.y, this.width, this.height)
}

/**
 * Returns a string representation of this object.
 * @method toString
 * @return {String} a string representation of the instance.
 **/
toString(): string {
  return (
    '[Rectangle (x=' +
    this.x +
    ' y=' +
    this.y +
    ' width=' +
    this.width +
    ' height=' +
    this.height +
    ')]'
  )
}
}
export default Rectangle
