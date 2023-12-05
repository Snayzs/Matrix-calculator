const isSquare = a => a.length == a[0].length
const getDiagonal = a => ({
  main: a.cell.map((e, i) => e[i]),
  side: a.cell.map((e, i) => e[a.row - i - 1]).reverse()
})
const getCol = a => (
  a.cell.map(e => e.length).reduce((a, b) => a + b) / a.row
)

const isZero = a => a.flat().filter(e => e != 0).length == 0

const isSymmetric = a => {
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < a[i].length; j++) {
      if (a[i][j] != a[j][i]) {
        return false
      }
    }
  }
  return true
}

const isDiagonal = a => {
  let up = []
  let down = []
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[i].length; j++) {
      if (i < j) {
        up.push(a[i][j])
      } else if (i > j) {
        down.push(a[i][j])
      }
    }
  }

  const isUp = up.every(e => e == 0)
  const isDown = down.every(e => e == 0)

  if (isUp && isDown) {
    return [
      up.reduce((a, b) => a + b),
      down.reduce((a, b) => a + b)]
  } else if (isUp) {
    return [
      up.reduce((a, b) => a + b), true]
  } else if (isDown) {
    return [
      true, down.reduce((a, b) => a + b)]
  }

}

const sorrus = (cell, steps) => {
  let operation = `  ((${cell[0][0]} * ${cell[1][1]} * ${cell[2][2]}) + (${cell[0][1]} * ${cell[1][2]} * ${cell[2][0]}) + (${cell[0][2]} * ${cell[1][0]} * ${cell[2][1]})) \n- ((${cell[0][2]} * ${cell[1][1]} * ${cell[2][0]}) + (${cell[0][0]} * ${cell[1][2]} * ${cell[2][1]}) + (${cell[0][1]} * ${cell[1][0]} * ${cell[2][2]}))`

  return steps ? operation.replaceAll('*', '×') : eval(operation)
}

const expand = (a) => {
  let arr = [];

  for (let i = 0; i < 18; i++) {
    arr.push([]);
  }

  let cell = [1, 2, 0, 2, 0, 1];

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      arr[i][j] = a.cell[cell[j]][cell[i]];
      arr[i + 6][j] = a.cell[cell[j + 2]][cell[i]];
      arr[i + 12][j] = a.cell[cell[j + 4]][cell[i]];
    }
  }

  const group = [];
  for (let i = 0; i < arr.length; i += 2) {
    group.push([arr[i], arr[i + 1]]);
  }

  let subMatrix = []
  for (var i = 0; i < group.length; i += 3) {
    subMatrix.push([group[i], group[i + 1], group[i + 2]])
  }

  let n = 0
  subMatrix = subMatrix.map((el) =>
    el.map((e) => {

      n++
      let sign = n % 2 == 0 ? -1 : 1

      return sign * new Matrix(e).transpose().determinant()
    })
  )

  return subMatrix
};







class Matrix {
  constructor(array) {
    this.cell = array
    this.row = this.cell.length
    this.col = getCol(this) % 1 == 0 ? getCol(this) : undefined

    if (!this.col) return
    this.ordo = this.row + '×' + this.col
    this.type = isSquare(this.cell) ? 'Square' : 'rectangle'
    this.diagonal = (this.type == 'Square') ? getDiagonal(this) : undefined
  }

  identify() {
    if (isZero(this.cell)) {
      return 'Matrix O'
    }
    else if (this.row == 1) {
      return 'Matrix Row'
    }
    else if (this.col == 1) {
      return 'Matrix Column'
    }
    else if (isDiagonal(this.cell) && this.diagonal) {
      let [a, b] = isDiagonal(this.cell)

      if (a == 0 && b == 0) {
        if (this.diagonal.main.every(e => e == 1)) {
          return 'Matrix Identity'
        } else if (this.diagonal.main.filter(e => e != 0).length >= 1) {
          return 'Matrix Diagonal'
        }
      }

      if (b == 0) {
        return 'Matrix Triangular up'
      }
      else if (a == 0) {
        return 'Matrix Triangular down'
      }
    }
    else if (isSymmetric(this.cell) && this.diagonal) {
      return 'Matrix Symmetric'
    }
  }

  trace() {
    if (this.diagonal) {
      return this.diagonal.main.reduce((a, b) => a + b)
    }
  }

  transpose() {
    let cell = Array(this.col);
    for (var i = 0; i < this.col; i++) {
      cell[i] = [];
      for (var j = 0; j < this.row; j++) {
        cell[i][j] = this.cell[j][i];
      }
    }
    return new Matrix(cell);
  }

  scallar(num, steps) {
    let result = this.cell.map(row => row.map(cell => steps ? cell + `×${num}` : cell * num))

    return new Matrix(result)
  }

  determinant(steps) {
    switch (this.ordo) {
      case '2×2':
        let [[a, b], [c, d]] = this.cell
        return steps ?
          `(${a} × ${d}) - (${c} × ${b})` :
          a * d - c * b
        break;
      case '3×3':
        return sorrus(this.cell, steps)
        break;
    }
  }

  cofactor() {
    if (this.ordo == '3×3') {
      return new Matrix(expand(this))
    }
  }

  adjoin() {
    if (this.ordo == '2×2') {
      let [[a, b], [c, d]] = this.cell
      return new Matrix([[d, -b], [-c, a]])
    } else if (this.ordo == '3×3') {
      return this.cofactor().transpose()
    }
  }

  inverse(steps) {
    if (this.determinant() == 0) return
    if (this.ordo == '2×2' || this.ordo == '3×3') {
      let det = this.determinant()
      return this.adjoin().scallar(
        steps ? `(1/ ${det})` : 1 / det,
        steps
      )
    }
  }

  format() {
    return `[${this.cell.join(']\n[')}]`
  }

}



Array.prototype.sum = function(operator = '+') {
  let [a, b] = this

  if (b && a.ordo == b.ordo) {
    let [eq1, eq2] = [[...a.cell], [...b.cell]]

    let arr = eq1.map((row, i) =>
      row.map((cell, j) => {
        switch (operator) {
          case '+':
            return cell + eq2[i][j]
            break;
          case '-':
            return cell - eq2[i][j]
            break;
        }
      }))
    return new Matrix(arr)

  } else {
    return 'error'
  }
}

Array.prototype.multiple = function(steps) {
  let [eq1, eq2] = this;

  if (eq2 && eq1.col == eq2.row) {
    let result = [];

    for (let i = 0; i < eq1.row; i++) {
      result.push([]);
      for (let j = 0; j < eq2.col; j++) {
        let sum = steps ? [] : 0
        for (let k = 0; k < eq1.col; k++) {
          steps ?
            sum.push(`(${eq1.cell[i][k]} × ${eq2.cell[k][j]})`) :

            sum += eq1.cell[i][k] * eq2.cell[k][j]
        }
        result[i].push(steps ? sum.join('+') : sum);
      }
    }
    return new Matrix(result)

  } else {
    return 'error';
  }
}

Object.prototype.power = function(num = 1, steps) {
  if (this.type == 'square') {
    return num <= 1 ? this : [this, this].multiple(steps).power(num - 1)

  } else return 'error'
}





const formula = [
  [
    [1, 3],
    [-3, 2]
  ],
  [
    [4, 5],
    [-2, 3]
  ],
  [
    [],
    []
  ],
]

const [matrix1, matrix2, matrix3] = formula.map(item => new Matrix(item))

let result = [matrix1.inverse(), matrix2.transpose()].multiple().determinant()

console.log(typeof result == 'object' ? result.format() : result)