use std::fmt::Display;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use serde::Serialize;

#[wasm_bindgen]
pub struct Minesweeper {
    edge: usize,
    cells: Vec<Vec<CellState>>,
    rerender: Vec<(u32, u32)>
}

#[wasm_bindgen]
impl Minesweeper {
    #[wasm_bindgen(constructor)]
    pub fn new(edge: usize, bomb_count: usize) -> Self {
        let mut cells: Vec<Vec<CellState>> = random::get_mine_positions(bomb_count, edge)
            .into_iter()
            .map(|row| row.into_iter().map(CellState::new).collect())
            .collect();

        for y in 0..edge {
            for x in 0..edge {
                if !cells[y][x].is_mine {
                    let mut mine_count = 0;
                    Self::check_adjacent(x as u32, y as u32, edge, &mut |x, y| {
                        if cells[y as usize][x as usize].is_mine {
                            mine_count += 1;
                        }
                    });
                    cells[y][x].adjacent_mines = mine_count;
                }
            }
        }

        Self {
            edge,
            cells,
            rerender: Vec::new()
        }
    }

    fn check_adjacent(x: u32, y: u32, edge: usize, f: &mut dyn FnMut(u32, u32)) {
        for i in (y.saturating_sub(1))..=(y + 1).min(edge as u32 - 1) {
            for j in (x.saturating_sub(1))..=(x + 1).min(edge as u32 - 1) {
                f(j, i);
            }
        }
    }

    pub fn open_helper(&mut self, x: u32, y: u32) {
        if self.cells[y as usize][x as usize].is_revealed {
            return;
        }
        self.cells[y as usize][x as usize].is_revealed = true;
        self.rerender.push((x, y));
        if self.cells[y as usize][x as usize].adjacent_mines == 0 {
            self.rerender.push((x, y));
            Self::check_adjacent(x, y, self.edge, &mut |x, y| self.open_helper(x, y));
        }
    }

    #[wasm_bindgen(js_name = open)]
    pub fn open(&mut self, x: u32, y: u32) -> Vec<JsValue>{
        self.open_helper(x, y);
        self.rerender.drain(..).map(|(x, y)| serde_wasm_bindgen::to_value(&[x, y]).unwrap()).collect()
    }

    #[wasm_bindgen(js_name = toggleFlag)]
    pub fn toggle_flag(&mut self, x: u32, y: u32) {
        if self.cells[y as usize][x as usize].is_revealed {
            return;
        }
        self.cells[y as usize][x as usize].is_flagged = true;
    }

    #[wasm_bindgen(js_name = isWon)]
    pub fn is_won(&self) -> bool {
        self.cells.iter().all(|row| row.iter().all(|cell| cell.is_revealed || cell.is_mine))
    }

    #[wasm_bindgen(js_name = isLost)]
    pub fn is_lost(&self) -> bool {
        self.cells.iter().any(|row| row.iter().any(|cell| cell.is_revealed && cell.is_mine))
    }

    #[wasm_bindgen(js_name = isFinished)]
    pub fn is_finished(&self) -> bool {
        self.is_won() || self.is_lost()
    }

    #[wasm_bindgen(js_name = getIcon)]
    pub fn get_icon(&self, x: u32, y: u32) -> String {
        let cell = &self.cells[y as usize][x as usize];
        if cell.is_mine {
            if cell.is_flagged {
                "🚩".to_string()
            } else {
                "💣".to_string()
            }
        } else if cell.is_revealed {
            if cell.adjacent_mines == 0 {
                "".to_string()
            } else {
                cell.adjacent_mines.to_string()
            }
        } else if cell.is_flagged {
            "🚩".to_string()
        } else {
            "🟦".to_string()
        }
    }
}

impl Display for Minesweeper {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for row in &self.cells {
            for cell in row {
                write!(f, "{}", cell)?;
            }
            writeln!(f)?;
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct CellState {
    is_mine: bool,
    is_revealed: bool,
    is_flagged: bool,
    adjacent_mines: u8,
}

impl CellState {
    fn new(is_bomb: bool) -> Self {
        Self {
            is_mine: is_bomb,
            is_revealed: false,
            is_flagged: false,
            adjacent_mines: 0,
        }
    }
}

impl Display for CellState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.is_revealed {
            if self.is_mine {
                write!(f, "💣")
            } else {
                write!(f, "{} ", self.adjacent_mines)
            }
        } else if self.is_flagged {
            write!(f, "🚩")
        } else {
            write!(f, "🟦")
        }
    }
}

mod random {
    #[cfg(not(target_family = "wasm"))]
    use rand::{Rng, thread_rng};
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = Math)]
        fn random() -> f64;
    }

    #[cfg(target_family = "wasm")]
    pub fn random_range(max: usize) -> usize {
        (random() * max as f64).floor() as usize
    }
    
    #[cfg(not(target_family = "wasm"))]
    pub fn random_range(max: usize) -> usize {
        let mut rng = rand::thread_rng();
        rng.gen_range(0..max)
    }

    pub fn get_mine_positions(mut mine_count: usize, edge: usize) -> Vec<Vec<bool>> {
        let mut mine_positions = vec![vec![false; edge]; edge];
        while mine_count > 0 {
            let x = random_range(edge);
            let y = random_range(edge);
            if !mine_positions[y][x] {
                mine_positions[y][x] = true;
                mine_count -= 1;
            }
        }
        mine_positions
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_minesweeper() {
        let mut game = Minesweeper::new(10, 10);
        game.open(0, 0);
        assert_eq!(game.cells[0][0].is_revealed, true);
    }
}
